# Argo UI

This branch contains a prototype of integrating [Argu-UI](https://github.com/argoproj/argo-ui) into Stratos. Since
this is just a prototype and the development version of Argo requires no authentication, it was integrated in much
the same way as the Kubernetes dashboard, which is to say, that is shown within a tab in when displaying the details
of a particular connected Kubernetes cluster.

## Prerequisities

This work assumes that the Argo-UI is already running, and does not attempt to start a new instance of it.
The [Argo-UI README](https://github.com/argoproj/argo-ui/blob/master/README.md) has instructions for running Argui-UI.
What is missing from them is that [Argo](https://github.com/argoproj/argo) also has to be running, and
its [README](https://github.com/argoproj/argo/blob/master/README.md) has instructions for running that within
Kubernetes.

## General Approach

The approach taken to develop this prototype was to 

- clone the
[kubernetes-dashboard](custom-src/frontend/app/custom/kubernetes/kubernetes-dashboard) to create the
[argo-dashboard](custom-src/frontend/app/custom/kubernetes/argo-dashboard), and add it as a tab
in the [kubernetes-summary component](custom-src/frontend/app/custom/kubernetes/tabs/kubernetes-summary-tab/kubernetes-summary.component.html)
- clone [kube_dashboard.go](src/jetstream/plugins/kubernetes/kube_dashboard.go) into
   [argo_dashboard.go](src/jetstream/plugins/kubernetes/argo_dashboard.go) and register its routes in the 
   [kubernetes plugin](src/jetstream/plugins/kubernetes/main.go).

Most of that was fairly straightforward, and it helped to develop it piecewise: for example, clone as little as possible 
in order to make a new dashboard appear but with the same contents, and progressively clone new smaller pieces until the
entire front-end and back-end were separate.

## Challenges / Limitations

Within Stratos the hardest part was getting the logic correct so that the dashboard properly recognized when the
Argo UI was fully loaded and available in the new iframe, which is done in [argo-dashboard.component.ts](custom-src/frontend/app/custom/kubernetes/argo-dashboard/argo-dashboard.component.ts).

By far the most challenging aspect was outside of Stratos: it was that Argo-UI does not lend itself well to 
running behind a proxy, which is essentially what jetstream is.  One of the challenges is that the html source fo
argo has a header containing [`<base href="/">`](https://github.com/argoproj/argo-ui/blob/master/src/app/index.html#L7), which
effectively forces all HTML references to be absolute references,
and effectivly bypasses the URL on which jetstream is serving up Argo-UI, which is at a location that begins with
`/pp/v1/argodash/ui/<GUID>/`.  The UI code then also looks for this `base href` in order to make REST calls to the
back-end, too.  Removing the line from the html template is enough to get the Argo-UI code to load properly, but more
work is needed in order for its REST calls to succeed.   This problem has been reported in a 
[couple](https://github.com/argoproj/argo/issues/716)
[of](https://github.com/argoproj/argo/issues/1215)
[issues](https://github.com/kubeflow/kubeflow/issues/1694),
but the "solution" of binding it to another fixed URL still does not work in general.

For the purposes of the POC,
Stratos is assuming that Argo-UI is listening on http://localhost:8081, which is its default location in develoment
mode.  To make this production-ready, the UI would need to have a configurable location, or possibly even its own
endpoint.
