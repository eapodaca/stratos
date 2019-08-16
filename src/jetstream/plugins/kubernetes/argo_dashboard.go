package kubernetes

import (
	//"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"

	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"

	utilnet "k8s.io/apimachinery/pkg/util/net"
	"k8s.io/client-go/rest"
)

// GET /api/v1/namespaces/{namespace}/pods/{name}/proxy

// http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/.

//GET /api/v1/namespaces/{namespace}/services/{name}/proxy

func (k *KubernetesSpecification) argoDashboardProxy(c echo.Context) error {
	log.Debug("argoDashboardProxy request")

	//	c.Response().Header().Set("X-FRAME-OPTIONS", "sameorigin")

	cnsiGUID := c.Param("guid")
	userGUID := c.Get("user_id").(string)

	var p = k.portalProxy

	// log.Info(c.Request().RequestURI)

	var prefix = "/pp/v1/argodash/ui/" + cnsiGUID + "/"
	path := c.Request().RequestURI[len(prefix):]

	cnsiRecord, err := p.GetCNSIRecord(cnsiGUID)
	if err != nil {
		//return sendSSHError("Could not get endpoint information")
		return errors.New("Could not get endpoint information")
	}

	// Get token for this users
	tokenRec, ok := p.GetCNSITokenRecord(cnsiGUID, userGUID)
	if !ok {
		//return sendSSHError("Could not get endpoint information")
		return errors.New("Could not get token")
	}

	log.Debug(tokenRec.AuthToken)
	log.Debug(tokenRec.AuthType)

	// Make the info call to the SSH endpoint info
	// Currently this is not cached, so we must get it each time
	apiEndpoint := cnsiRecord.APIEndpoint

	// target := fmt.Sprintf("%s/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/", apiEndpoint)
	// target := fmt.Sprintf("%s/api/v1/namespaces/kube-system/services/http:kubernetes-dashboard:/proxy/", apiEndpoint)

	// TODO: Need namespace and whether it is https or http
	// target := fmt.Sprintf("%s/api/v1/namespaces/kube-system/services/http:kubernetes-dashboard:/proxy/%s", apiEndpoint, path)
	target := fmt.Sprintf("%s/api/v1/namespaces/argo/services/argo-ui/proxy/%s", apiEndpoint, path)
	target = fmt.Sprintf("%s/%s", "http://localhost:8081/", path)
	// target := fmt.Sprintf("%s/%s", apiEndpoint, path)
	log.Debug(target)
	targetURL, _ := url.Parse(target)
	targetURL = normalizeLocation(targetURL)

	config, err := getConfig(&cnsiRecord, &tokenRec)
	if err != nil {
		return errors.New("Could not get config for this auth type")
	}

	log.Info("Config")
	log.Info(config.Host)
	log.Info("Making request")
	req := c.Request()
	w := c.Response().Writer
	log.Info("%v+", req)

	// if h.tryUpgrade(w, req) {
	// 	return
	// }
	// if h.UpgradeRequired {
	// 	h.Responder.Error(w, req, errors.NewBadRequest("Upgrade request required"))
	// 	return
	// }

	loc := targetURL
	loc.RawQuery = req.URL.RawQuery

	// If original request URL ended in '/', append a '/' at the end of the
	// of the proxy URL
	if !strings.HasSuffix(loc.Path, "/") && strings.HasSuffix(req.URL.Path, "/") {
		loc.Path += "/"
	}

	log.Info(loc)

	// From pkg/genericapiserver/endpoints/handlers/proxy.go#ServeHTTP:
	// Redirect requests with an empty path to a location that ends with a '/'
	// This is essentially a hack for http://issue.k8s.io/4958.
	// Note: Keep this code after tryUpgrade to not break that flow.
	if len(loc.Path) == 0 {
		log.Info("Redirecting")
		var queryPart string
		if len(req.URL.RawQuery) > 0 {
			queryPart = "?" + req.URL.RawQuery
		}
		w.Header().Set("Location", req.URL.Path+"/"+queryPart)
		w.WriteHeader(http.StatusMovedPermanently)
		return nil
	}

	// if transport == nil || wrapTransport {
	// 	h.Transport = h.defaultProxyTransport(req.URL, h.Transport)
	// }

	transport, err := rest.TransportFor(config)
	if err != nil {
		log.Info("Could not get transport")
		return err
	}

	log.Info(transport)

	// WithContext creates a shallow clone of the request with the new context.
	newReq := req.WithContext(req.Context())
	//newReq := req.WithContext(context.Background())
	newReq.Header = utilnet.CloneHeader(req.Header)
	newReq.URL = loc

	// Set auth header so we log in if needed
	if len(tokenRec.AuthToken) > 0 {
		newReq.Header.Add("Authorization", "Bearer "+tokenRec.AuthToken)
		log.Info("Setting auth header")
	}

	proxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: loc.Scheme, Host: loc.Host})
	proxy.Transport = transport
	proxy.FlushInterval = defaultFlushInterval
	proxy.ModifyResponse = func(response *http.Response) error {
		log.Debugf("GOT PROXY RESPONSE: %s", loc.String())
		log.Debugf("%d", response.StatusCode)
		log.Debug(response.Header.Get("Content-Type"))

		log.Debugf("%v+", response.Header)
		response.Header.Del("X-FRAME-OPTIONS")
		response.Header.Set("X-FRAME-OPTIONS", "sameorigin")
		log.Debug("%v+", response)
		return nil
	}

	log.Errorf("Proxy: %s", target)

	// Note that ServeHttp is non blocking and uses a go routine under the hood
	proxy.ServeHTTP(w, newReq)

	// We need this to be blocking

	// select {
	// case <-newReq.Context().Done():
	// 	return newReq.Context().Err()
	// }

	log.Errorf("Finished proxying request: %s", target)

	return nil
}

// Determine if the specified Kube endpoint has the dashboard installed and ready
func (k *KubernetesSpecification) argoDashboardStatus(c echo.Context) error {
	endpointGUID := c.Param("guid")

	status := dashboardStatusResponse{
		Endpoint:  endpointGUID,
		Installed: false,
	}

	pod, err := k.getKubeDashboardPod(c, "app%3Dkubernetes-dashboard")
	if err != nil {
		pod, err = k.getKubeDashboardPod(c, "k8s-app%3Dkubernetes-dashboard")
	}

	status.Pod = pod
	if err == nil {
		status.Installed = true
	}

	jsonString, err := json.Marshal(status)
	if err != nil {
		return interfaces.NewHTTPShadowError(
			http.StatusBadRequest,
			"Unable Marshal status response",
			"Unable Marshal status response")
	}

	c.Response().Header().Set("Content-Type", "application/json")
	c.Response().Write(jsonString)
	return nil
}
