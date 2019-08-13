import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IHeaderBreadcrumb } from '../../../shared/components/page-header/page-header.types';
import { BaseKubeGuid } from '../kubernetes-page.types';
import { KubernetesEndpointService } from '../services/kubernetes-endpoint.service';
import { KubernetesService } from '../services/kubernetes.service';

@Component({
  selector: 'app-argo-dashboard',
  templateUrl: './argo-dashboard.component.html',
  styleUrls: ['./argo-dashboard.component.scss'],
  providers: [
    {
      provide: BaseKubeGuid,
      useFactory: (activatedRoute: ActivatedRoute) => {
        return {
          guid: activatedRoute.snapshot.params.endpointId
        };
      },
      deps: [
        ActivatedRoute
      ]
    },
    KubernetesService,
    KubernetesEndpointService,
  ]
})
export class ArgoDashboardTabComponent implements OnInit {

  private pKubeDash: ElementRef;
  @ViewChild('argoDash', { read: ElementRef }) set kubeDash(kubeDash: ElementRef) {
    if (!this.pKubeDash) {
      this.pKubeDash = kubeDash;
      // Need to look at this process again. In tests this is never hit, leading to null references to kubeDash
      this.setupEventListener();
    }
  }
  get kubeDash(): ElementRef {
    return this.pKubeDash;
  }

  source: SafeResourceUrl;
  isLoading$ = new BehaviorSubject<boolean>(true);
  expanded = false;

  searchTerms: any;

  href = '';

  private haveSetupEventLister = false;
  private hasIframeLoaded = false;

  public breadcrumbs$: Observable<IHeaderBreadcrumb[]>;

  constructor(public kubeEndpointService: KubernetesEndpointService, private sanitizer: DomSanitizer, public renderer: Renderer2) { }

  ngOnInit() {
    const guid = this.kubeEndpointService.baseKube.guid;

    let href = window.location.href;
    const marker = 'argoDashboard';
    const index = href.indexOf(marker);
    href = href.substr(index + marker.length);
    console.log('href', href);
    this.href = href;
    this.source = this.sanitizer.bypassSecurityTrustResourceUrl(`/pp/v1/kubedash/ui/${guid}/`);
    // console.log(window.location);

    this.breadcrumbs$ = this.kubeEndpointService.endpoint$.pipe(
      map(endpoint => ([{
        breadcrumbs: [
          { value: endpoint.entity.name, routerLink: `/kubernetes/${endpoint.entity.guid}` },
        ]
      }])
      )
    );
  }

  iframeLoaded() {
    const kdToolbar = this.getKubeDashToolbar();
    if (!!kdToolbar) {
      this.isLoading$.next(false);
      this.toggle(false);
    }
    this.hasIframeLoaded = true;
    this.setupEventListener();
  }

  setupEventListener() {
    if (this.haveSetupEventLister || !this.kubeDash || !this.hasIframeLoaded) {
      return;
    }

    this.haveSetupEventLister = true;

    const iframeWindow = this.kubeDash.nativeElement.contentWindow;
    // console.log('iframe loaded');

    iframeWindow.addEventListener('hashchange', () => {
      // Object.defineProperty( event, "oldURL", { enumerable: true, configurable: true, value: lastURL } );
      // Object.defineProperty( event, "newURL", { enumerable: true, configurable: true, value: document.URL } );
      // lastURL = document.URL;
      // console.log('iframe hashchange');
      // console.log(event);

      // console.log(iframeWindow.location);

      // console.log(this.href);

      if (this.href) {
        let h2 = decodeURI(this.href);
        h2 = decodeURI(h2);

        h2 = h2.replace('%3F', '?');
        h2 = h2.replace('%3D', '=');
        // console.log(h2);
        h2 = '#!' + h2;
        // console.log('Changing location hash');
        iframeWindow.location.hash = h2;
        this.href = '';
      }
    });
  }

  toggle(val: boolean) {
    if (val !== undefined) {
      this.expanded = val;
    } else {
      this.expanded = !this.expanded;
    }

    const height = this.expanded ? '48px' : '0px';
    const kdToolbar = this.getKubeDashToolbar();
    if (!!kdToolbar) {
      this.renderer.setStyle(kdToolbar, 'height', height);
      this.renderer.setStyle(kdToolbar, 'minHeight', height);
    }
  }

  private getKubeDashToolbar() {
    if (this.kubeDash &&
      this.kubeDash.nativeElement &&
      this.kubeDash.nativeElement.contentDocument &&
      this.kubeDash.nativeElement.contentDocument.getElementsByTagName) {
      const kdChrome = this.kubeDash.nativeElement.contentDocument.getElementsByTagName('kd-chrome')[0];
      if (kdChrome) {
        const kdToolbar = kdChrome.getElementsByTagName('md-toolbar')[0];
        return kdToolbar;
      }
    }
    return null;
  }

}
