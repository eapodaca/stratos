import { getPaginationKey } from '../../../store/actions/pagination.actions';
import {
  entityFactory,
  kubernetesAppsSchemaKey,
  kubernetesNamespacesSchemaKey,
  kubernetesNodesSchemaKey,
  kubernetesPodsSchemaKey,
  kubernetesServicesSchemaKey,
  kubernetesStatefulSetsSchemaKey,
  kubernetesDeploymentsSchemaKey,
} from '../../../store/helpers/entity-factory';
import { PaginatedAction } from '../../../store/types/pagination.types';
import { MetricsAction } from '../../../store/actions/metrics.actions';
import { Action } from '@ngrx/store';
import { ICFAction } from '../../../store/types/request.types';

export const GET_NODE_INFO = '[KUBERNETES Endpoint] Get Nodes Info';
export const GET_NODE_INFO_SUCCESS = '[KUBERNETES Endpoint] Get Nodes Info Success';
export const GET_NODE_INFO_FAILURE = '[KUBERNETES Endpoint] Get Nodes Info Failure';

export const GET_POD_INFO = '[KUBERNETES Endpoint] Get Pod Info';
export const GET_POD_INFO_SUCCESS = '[KUBERNETES Endpoint] Get Pod Info Success';
export const GET_POD_INFO_FAILURE = '[KUBERNETES Endpoint] Get Pod Info Failure';

export const GET_NAMESPACES_INFO = '[KUBERNETES Endpoint] Get Namespaces Info';
export const GET_NAMESPACES_INFO_SUCCESS = '[KUBERNETES Endpoint] Get Namespaces Info Success';
export const GET_NAMESPACES_INFO_FAILURE = '[KUBERNETES Endpoint] Get Namespaces Info Failure';

export const GET_KUBERNETES_APP_INFO = '[KUBERNETES Endpoint] Get Kubernetes App Info';
export const GET_KUBERNETES_APP_INFO_SUCCESS = '[KUBERNETES Endpoint] Get Kubernetes App Info Success';
export const GET_KUBERNETES_APP_INFO_FAILURE = '[KUBERNETES Endpoint] Get Kubernetes App Info Failure';

export const GET_SERVICE_INFO = '[KUBERNETES Endpoint] Get Services Info';
export const GET_SERVICE_INFO_SUCCESS = '[KUBERNETES Endpoint] Get Services Info Success';
export const GET_SERVICE_INFO_FAILURE = '[KUBERNETES Endpoint] Get Services Info Failure';

export const GET_KUBE_POD = '[KUBERNETES Endpoint] Get K8S Pod Info';
export const GET_KUBE_POD_SUCCESS = '[KUBERNETES Endpoint] Get K8S Pod  Success';
export const GET_KUBE_POD_FAILURE = '[KUBERNETES Endpoint] Get K8S Pod  Failure';

export const GET_KUBE_STATEFULSETS = '[KUBERNETES Endpoint] Get K8S Stateful Sets Info';
export const GET_KUBE_STATEFULSETS_SUCCESS = '[KUBERNETES Endpoint] Get Stateful Sets Success';
export const GET_KUBE_STATEFULSETS_FAILURE = '[KUBERNETES Endpoint] Get Stateful Sets Failure';

export const GET_KUBE_DEPLOYMENT = '[KUBERNETES Endpoint] Get K8S Deployments Info';
export const GET_KUBE_DEPLOYMENT_SUCCESS = '[KUBERNETES Endpoint] Get Deployments Success';
export const GET_KUBE_DEPLOYMENT_FAILURE = '[KUBERNETES Endpoint] Get Deployments Failure';

export class GetKubernetesNodes implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesNodesSchemaKey, kubeGuid);
  }
  type = GET_NODE_INFO;
  entityKey = kubernetesNodesSchemaKey;
  entity = [entityFactory(kubernetesNodesSchemaKey)];
  actions = [
    GET_NODE_INFO,
    GET_NODE_INFO_SUCCESS,
    GET_NODE_INFO_FAILURE
  ];
  paginationKey: string;
}

export class GetKubernetesPods implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesPodsSchemaKey, kubeGuid);
  }
  type = GET_POD_INFO;
  entityKey = kubernetesPodsSchemaKey;
  entity = [entityFactory(kubernetesPodsSchemaKey)];
  actions = [
    GET_POD_INFO,
    GET_POD_INFO_SUCCESS,
    GET_POD_INFO_FAILURE
  ];
  paginationKey: string;
}
export class GetKubernetesNamespaces implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesNamespacesSchemaKey, kubeGuid);
  }
  type = GET_NAMESPACES_INFO;
  entityKey = kubernetesNamespacesSchemaKey;
  entity = [entityFactory(kubernetesNamespacesSchemaKey)];
  actions = [
    GET_NAMESPACES_INFO,
    GET_NAMESPACES_INFO_SUCCESS,
    GET_NAMESPACES_INFO_FAILURE
  ];
  paginationKey: string;
}
export class GetKubernetesApps implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesAppsSchemaKey, kubeGuid);
  }
  type = GET_KUBERNETES_APP_INFO;
  entityKey = kubernetesAppsSchemaKey;
  entity = [entityFactory(kubernetesAppsSchemaKey)];
  actions = [
    GET_KUBERNETES_APP_INFO,
    GET_KUBERNETES_APP_INFO_SUCCESS,
    GET_KUBERNETES_APP_INFO_FAILURE
  ];
  paginationKey: string;
}
export class GetKubernetesServices implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesServicesSchemaKey, kubeGuid);
  }
  type = GET_SERVICE_INFO;
  entityKey = kubernetesServicesSchemaKey;
  entity = [entityFactory(kubernetesServicesSchemaKey)];
  actions = [
    GET_SERVICE_INFO,
    GET_SERVICE_INFO_SUCCESS,
    GET_SERVICE_INFO_FAILURE
  ];
  paginationKey: string;
}
export class GetKubernetesPod implements Action {
  constructor(public podName, public namespaceName, public kubeGuid) {
  }
  type = GET_KUBE_POD;
  entityKey = kubernetesPodsSchemaKey;
  entity = [entityFactory(kubernetesPodsSchemaKey)];
  actions = [
    GET_KUBE_POD,
    GET_KUBE_POD_SUCCESS,
    GET_KUBE_POD_FAILURE
  ];
}
export class GetKubernetesStatefulSets implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesStatefulSetsSchemaKey, kubeGuid);
  }
  type = GET_KUBE_STATEFULSETS;
  entityKey = kubernetesStatefulSetsSchemaKey;
  entity = [entityFactory(kubernetesStatefulSetsSchemaKey)];
  actions = [
    GET_KUBE_STATEFULSETS,
    GET_KUBE_STATEFULSETS_SUCCESS,
    GET_KUBE_STATEFULSETS_FAILURE
  ];
  paginationKey: string;

}
export class GeKubernetesDeployments implements PaginatedAction {
  constructor(public kubeGuid) {
    this.paginationKey = getPaginationKey(kubernetesDeploymentsSchemaKey, kubeGuid);
  }
  type = GET_KUBE_DEPLOYMENT;
  entityKey = kubernetesDeploymentsSchemaKey;
  entity = [entityFactory(kubernetesDeploymentsSchemaKey)];
  actions = [
    GET_KUBE_DEPLOYMENT,
    GET_KUBE_DEPLOYMENT_SUCCESS,
    GET_KUBE_DEPLOYMENT_FAILURE
  ];
  paginationKey: string;

}

export class FetchKubernetesMetricsAction extends MetricsAction {
  constructor(public guid: string, public cfGuid: string, public query: string) {
    super(guid, query);
    this.url = `${MetricsAction.getBaseMetricsURL()}/kubernetes/${guid}`;
  }
}