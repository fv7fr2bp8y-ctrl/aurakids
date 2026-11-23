module.exports=[95374,e=>{"use strict";var t=e.i(47909),r=e.i(74017),i=e.i(96250),a=e.i(59756),n=e.i(61916),o=e.i(74677),l=e.i(69741),s=e.i(16795),c=e.i(87718),u=e.i(95169),d=e.i(47587),p=e.i(66012),f=e.i(70101),h=e.i(26937),w=e.i(10372),x=e.i(93695),y=e.i(9580);e.i(52474);var g=e.i(220);let m=new t.AppRouteRouteModule({definition:{kind:r.f.APP_ROUTE,page:"/api/og-image/route",pathname:"/api/og-image",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/og-image/route.ts",nextConfigOutput:"standalone",userland:()=>e.r(81137),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:R,serverHooks:b}=m;async function C(e,t,r){r.requestMeta&&(0,a.R)(e,r.requestMeta),m.isDev&&(0,a.i)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let i="/api/og-image/route";i=i.replace(/\/index$/,"")||"/";let{instrumentation:o}=await m.ensureInstrumentation(e,{deferSpans:!0});return m.traceRequest(e,{tracer:(0,n.v)(),spanName:`${e.method||"GET"} ${i}`,httpTarget:e.url,instrumentation:o},(a,n)=>E(e,t,r,i,!1,a,n))}async function E(e,t,i,v,R,b,C){let E=await m.prepare(e,t,{srcPage:v,multiZoneDraftMode:R});if(!E)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:T,deploymentId:A,params:P,nextConfig:k,parsedUrl:O,isDraftMode:S,prerenderManifest:U,routerServerContext:G,isOnDemandRevalidate:B,revalidateOnlyGenerated:D,resolvedPathname:q,clientReferenceManifest:I,serverActionsManifest:M,previewProps:N}=E,_=(0,l.f)(v),$=!!U.routes[q]&&(m.isDev||(0,y.f)(q,m.cacheOwner,U.routes[q])),F=!!(U.dynamicRoutes[_]||$),H=async()=>((null==G?void 0:G.render404)?await G.render404(e,t,O,!1):t.end("This page could not be found"),null);if(F&&!S){let e=U.dynamicRoutes[_];if(e&&!1===e.fallback&&!$){if(k.adapterPath)return await H();throw new x.NoFallbackError}}let L=null;!F||m.isDev||S||(L="/index"===(L=q)?"/":L),M&&I&&(0,o.f)({page:v,clientReferenceManifest:I,serverActionsManifest:M});let j=e.method||"GET",z=(0,n.v)(),K=!!(null==G?void 0:G.isWrappedByNextServer),J=!!(0,a.w)(e,"minimalMode"),Q=(0,a.w)(e,"incrementalCache")||await m.getIncrementalCache(e,k,N,U,J);null==Q||Q.resetRequestCache(),globalThis.__incrementalCache=Q;let V={params:P,previewProps:N,renderOpts:{experimental:{authInterrupts:!!k.experimental.authInterrupts,useCacheTimeout:k.experimental.useCacheTimeout,durableUseCacheEntries:!!k.experimental.durableUseCacheEntries},cacheComponents:!!k.cacheComponents,validationLevel:k.experimental.instantInsights.validationLevel,isDraftMode:S,incrementalCache:Q,hmrRefreshHash:(0,a.w)(e,"hmrRefreshHash"),cacheLifeProfiles:k.cacheLife,staticPageGenerationTimeout:k.staticPageGenerationTimeout,waitUntil:i.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0},sharedContext:{buildId:T,deploymentId:A}},W=new s.x(e),X=new s.e(t),Y=c.k.fromNodeNextRequest(W,(0,c.t)(t)),Z=async({previousCacheEntry:r})=>{try{if(!J&&B&&D&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=null===L?await m.handle(Y,V):await m.prerender(Y,V);e.fetchMetrics=V.renderOpts.fetchMetrics;let n=V.renderOpts.pendingWaitUntil;n&&i.waitUntil&&(i.waitUntil(n),n=void 0);let o=V.renderOpts.collectedTags;if(!F)return await (0,p.f)(W,X,a,n),null;{let e=await a.blob(),t=(0,f.S)(a.headers);o&&(t[w.M]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=w.Q)&&V.renderOpts.collectedRevalidate,i=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=w.Q?!1!==r&&r>0?k.expireTime:void 0:V.renderOpts.collectedExpire;return{value:{kind:g.x.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:i}}}}catch(t){throw(null==r?void 0:r.isStale)&&await m.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,d.f)({isStaticGeneration:null!==L,isOnDemandRevalidate:B})},!1,G),t}},ee=async a=>{try{var o,l;let a=await m.handleResponse({req:e,nextConfig:k,cacheKey:L,routeKind:r.f.APP_ROUTE,isFallback:!1,previewProps:N,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:D,responseGenerator:Z,waitUntil:i.waitUntil,isMinimalMode:J});if(null!==a&&"error"in a)throw a.error;if(!F)return;if((null==a||null==(o=a.value)?void 0:o.kind)!==g.x.APP_ROUTE)throw Error(`Invariant: app-route received invalid cache entry ${null==a||null==(l=a.value)?void 0:l.kind}`);J||t.setHeader("x-nextjs-cache",B?"REVALIDATED":a.isMiss?"MISS":a.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let n=(0,f.G)(a.value.headers);J&&F||n.delete(w.M),!a.cacheControl||t.getHeader("Cache-Control")||n.get("Cache-Control")||n.set("Cache-Control",(0,h.f)(a.cacheControl)),await (0,p.f)(W,X,new Response(a.value.body,{headers:n,status:a.value.status||200}));return}catch(r){if(r instanceof x.NoFallbackError||await m.onRequestError(e,r,{routerKind:"App Router",routePath:_,routeType:"route",revalidateReason:(0,d.f)({isStaticGeneration:null!==L,isOnDemandRevalidate:B})},!1,G),F)throw r;if(t.headersSent){if(a){let e=r instanceof Error?r:Error("Unknown app route error");a.recordException(e),a.setStatus({code:n.J.ERROR,message:e.message}),a.setAttribute("error.type",e.name)}t.writableEnded||t.destroyed||t.end()}else await (0,p.f)(W,X,new Response(null,{status:500}));return}finally{(()=>{if(!a)return;let e=t.statusCode;a.setAttributes({"http.status_code":e,"next.rsc":!1}),e&&e>=500&&(a.setStatus({code:n.J.ERROR}),a.setAttribute("error.type",e.toString()));let r=z.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.q.handleRequest)return console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=r.get("next.route")||_,o=`${j} ${i}`;a.setAttributes({"next.route":i,"http.route":i,"next.span_name":o}),a.updateName(o),C&&C!==a&&(C.setAttribute("http.route",i),C.updateName(o))})()}};K||void 0===e.url||null==b||b.setAttribute("http.target",e.url),await ee(b)}e.s(["handler",0,C,"patchFetch",0,function(){return(0,i.f)({workAsyncStorage:v,workUnitAsyncStorage:R})},"routeModule",0,m,"serverHooks",0,b,"workAsyncStorage",0,v,"workUnitAsyncStorage",0,R])},81137,e=>{"use strict";var t=e.i(89171),r=e.i(44070);async function i(){let e=await (0,r.A)("logo-mark-v5.png"),i=e?`<image href="${e}" x="80" y="160" width="260" height="260" />`:"",a=`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A0533"/>
      <stop offset="60%" stop-color="#3B1A6B"/>
      <stop offset="100%" stop-color="#6B35B8"/>
    </linearGradient>
    <radialGradient id="glow1" cx="30%" cy="50%" r="40%">
      <stop offset="0%" stop-color="rgba(255,107,107,0.18)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="40%" r="35%">
      <stop offset="0%" stop-color="rgba(255,217,61,0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- Stars -->
  <circle cx="120" cy="80" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="340" cy="45" r="1" fill="white" opacity="0.5"/>
  <circle cx="890" cy="60" r="2" fill="white" opacity="0.8"/>
  <circle cx="1050" cy="120" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="200" cy="520" r="1" fill="white" opacity="0.5"/>
  <circle cx="1100" cy="480" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="750" cy="30" r="1" fill="white" opacity="0.6"/>
  <circle cx="980" cy="550" r="2" fill="white" opacity="0.5"/>

  <!-- Logo image -->
  ${i}

  <!-- Text block -->
  <text x="400" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">AuraKids</text>
  <text x="400" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="rgba(255,255,255,0.70)">Вълшебни приказки за твоето дете</text>

  <!-- Divider -->
  <line x1="400" y1="340" x2="900" y2="340" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

  <!-- Tagline -->
  <text x="400" y="395" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="rgba(255,255,255,0.50)">Детето ти е главният герой</text>

  <!-- CTA pill -->
  <rect x="400" y="430" width="280" height="56" rx="28" fill="url(#pill)"/>
  <defs>
    <linearGradient id="pill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FFD93D"/>
    </linearGradient>
  </defs>
  <text x="540" y="465" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#3B1A6B" text-anchor="middle">aurakids.fun</text>
</svg>`;return new t.NextResponse(a,{headers:{"Content-Type":"image/svg+xml","Cache-Control":"public, max-age=86400"}})}e.s(["GET",0,i,"maxDuration",0,10])}];

//# sourceMappingURL=_207-8sl58s1u7._.js.map