document.addEventListener(
  "DOMContentLoaded",
  function () {
    const loader =
      document.getElementById(
        "pageShimmerLoader"
      );

    document.body.classList.add(
      "page-is-loading"
    );

    let loaderRemoved = false;

    function hidePageLoader() {
      if (loaderRemoved) {
        return;
      }

      loaderRemoved = true;

      document.body.classList.remove(
        "page-is-loading"
      );

      document.body.classList.add(
        "page-is-ready"
      );

      if (loader) {
        loader.classList.add(
          "is-hidden"
        );
      }
    }

    /*
     * Normal page assets completed.
     */

    window.addEventListener(
      "load",
      function () {
        window.setTimeout(
          hidePageLoader,
          500
        );
      },
      {
        once: true
      }
    );

    /*
     * Safety fallback so loader never
     * remains permanently visible.
     */

    window.setTimeout(
      hidePageLoader,
      5000
    );

    /*
     * Database pages can manually call:
     * window.finishPageLoading()
     */

    window.finishPageLoading =
      hidePageLoader;
  }
);