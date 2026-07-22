document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const productsGrid =
      document.getElementById(
        "productsGrid"
      );

    const searchForm =
      document.getElementById(
        "searchForm"
      );

    const searchInput =
      document.getElementById(
        "searchInput"
      );

    const resultMessage =
      document.getElementById(
        "searchResultMessage"
      );

    if (!productsGrid) {
      console.error(
        "productsGrid was not found."
      );

      return;
    }

    const minimumShimmerTime = 2000;

    function escapeHTML(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function formatPrice(value) {
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }
      ).format(Number(value) || 0);
    }

    function wait(milliseconds) {
      return new Promise(
        function (resolve) {
          window.setTimeout(
            resolve,
            milliseconds
          );
        }
      );
    }

    function getProductImageUrl(value) {
      const imageValue =
        String(value || "").trim();

      if (!imageValue) {
        return "images/image-placeholder.png";
      }

      if (
        imageValue.startsWith("https://") ||
        imageValue.startsWith("http://")
      ) {
        return imageValue;
      }

      const cleanPath =
        imageValue
          .replace(
            /^product-images\//,
            ""
          )
          .replace(/^\/+/, "");

      const { data } =
        supabaseClient.storage
          .from("product-images")
          .getPublicUrl(cleanPath);

      return (
        data?.publicUrl ||
        "images/image-placeholder.png"
      );
    }

    /* =================================
       PRODUCT CARD SKELETON
    ================================= */

    function showProductShimmer() {
      productsGrid.innerHTML = "";

      const skeletonCount =
        window.innerWidth <= 700
          ? 9
          : 14;

      for (
        let index = 0;
        index < skeletonCount;
        index += 1
      ) {
        const skeleton =
          document.createElement(
            "article"
          );

        skeleton.className =
          "product-card homepage-product-skeleton";

        skeleton.innerHTML = `
          <div class="homepage-skeleton-image"></div>

          <div class="homepage-skeleton-content">
            <div class="homepage-skeleton-name"></div>
            <div class="homepage-skeleton-price"></div>
          </div>
        `;

        productsGrid.appendChild(
          skeleton
        );
      }
    }

    /* =================================
       REAL IMAGE SHIMMER
    ================================= */

    function setupProductImage(
      image,
      imageContainer,
      originalUrl
    ) {
      const imageStartedAt =
        Date.now();

      let fallbackUsed = false;
      let finished = false;

      function finishImageLoading() {
        if (finished) {
          return;
        }

        finished = true;

        const elapsedTime =
          Date.now() -
          imageStartedAt;

        const remainingTime =
          Math.max(
            minimumShimmerTime -
              elapsedTime,
            0
          );

        window.setTimeout(
          function () {
            imageContainer.classList.add(
              "image-loaded"
            );

            imageContainer.classList.remove(
              "image-loading"
            );
          },
          remainingTime
        );
      }

      image.addEventListener(
        "load",
        finishImageLoading,
        {
          once: true
        }
      );

      image.addEventListener(
        "error",
        function () {
          console.error(
            "Homepage product image failed:",
            originalUrl
          );

          if (!fallbackUsed) {
            fallbackUsed = true;

            image.src =
              "images/image-placeholder.png";

            return;
          }

          finishImageLoading();
        }
      );

      if (
        image.complete &&
        image.naturalWidth > 0
      ) {
        finishImageLoading();
      }

      window.setTimeout(
        finishImageLoading,
        6000
      );
    }

    /* =================================
       CREATE PRODUCT CARD
    ================================= */

    function createProductCard(product) {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "product-card";

      card.tabIndex = 0;

      card.setAttribute(
        "role",
        "link"
      );

      card.setAttribute(
        "aria-label",
        `View ${product.name}`
      );

      const imageUrl =
        getProductImageUrl(
          product.image_url
        );

    card.innerHTML = `
  <div class="product-image image-loading">
    <img
      src="${escapeHTML(imageUrl)}"
      alt="${escapeHTML(product.name)}"
      loading="lazy"
    >
  </div>

  <h3>
    ${escapeHTML(product.name)}
  </h3>
`;

      const imageContainer =
        card.querySelector(
          ".product-image"
        );

      const image =
        card.querySelector("img");

      if (
        imageContainer &&
        image
      ) {
        setupProductImage(
          image,
          imageContainer,
          product.image_url
        );
      }

      function openProduct() {
  window.location.href =
    `products.html?category=${encodeURIComponent(
      product.category || "all"
    )}&product=${encodeURIComponent(
      product.name
    )}`;
}

      card.addEventListener(
        "click",
        openProduct
      );

      card.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openProduct();
          }
        }
      );

      return card;
    }

    /* =================================
       LOAD PRODUCTS
    ================================= */

    async function loadProducts() {
      const loadingStartedAt =
        Date.now();

      showProductShimmer();

      if (resultMessage) {
        resultMessage.textContent = "";
        resultMessage.classList.remove(
          "is-error"
        );
      }

      try {
        const {
          data: products,
          error
        } =
          await supabaseClient
            .from("products")
            .select(
              `
                id,
                name,
                price,
                image_url,
                is_active,
                created_at
              `
            )
            .eq(
              "is_active",
              true
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            );

        if (error) {
          throw error;
        }

        /*
         * Keep skeleton visible for at
         * least two seconds.
         */

        const elapsedTime =
          Date.now() -
          loadingStartedAt;

        const remainingTime =
          Math.max(
            minimumShimmerTime -
              elapsedTime,
            0
          );

        await wait(remainingTime);

        productsGrid.innerHTML = "";

        if (
          !products ||
          products.length === 0
        ) {
          if (resultMessage) {
            resultMessage.textContent =
              "No products are available.";
          }

          return;
        }

        products.forEach(
          function (product) {
            productsGrid.appendChild(
              createProductCard(
                product
              )
            );
          }
        );
      } catch (error) {
        console.error(
          "Unable to load homepage products:",
          error
        );

        const elapsedTime =
          Date.now() -
          loadingStartedAt;

        const remainingTime =
          Math.max(
            minimumShimmerTime -
              elapsedTime,
            0
          );

        await wait(remainingTime);

        productsGrid.innerHTML = "";

        if (resultMessage) {
          resultMessage.textContent =
            "Unable to load products. Please refresh the page.";

          resultMessage.classList.add(
            "is-error"
          );
        }
      }
    }

    /* =================================
       SEARCH
    ================================= */

    if (
      searchForm &&
      searchInput
    ) {
      searchForm.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          const value =
            searchInput.value.trim();

          if (!value) {
            searchInput.focus();
            return;
          }

          window.location.href =
            "products.html?search=" +
            encodeURIComponent(value);
        }
      );
    }

    await loadProducts();
  }
);