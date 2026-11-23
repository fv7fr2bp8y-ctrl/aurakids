self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/apple-touch-icon.png",
        "destination": "/api/icon?size=180&app=both"
      },
      {
        "source": "/apple-touch-icon-precomposed.png",
        "destination": "/api/icon?size=180&app=both"
      },
      {
        "source": "/icon-192.png",
        "destination": "/api/icon?size=192&app=both"
      },
      {
        "source": "/icon-512.png",
        "destination": "/api/icon?size=512&app=both"
      },
      {
        "source": "/icon-maskable-512.png",
        "destination": "/api/icon?size=512&padded=1&app=both"
      },
      {
        "source": "/favicon.ico",
        "destination": "/api/icon?size=32&app=favicon&v=6"
      },
      {
        "source": "/favicon-32.png",
        "destination": "/api/icon?size=32&app=favicon"
      },
      {
        "source": "/.well-known/assetlinks.json",
        "destination": "/api/assetlinks"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()