document.addEventListener(
  "DOMContentLoaded",
  async function () {
    /* =================================
       HTML ELEMENTS
    ================================= */

    const catalogGrid =
      document.getElementById(
        "catalogGrid"
      );

    const catalogTitle =
      document.getElementById(
        "catalogTitle"
      );

    const catalogMessage =
      document.getElementById(
        "catalogMessage"
      );

    const searchForm =
      document.getElementById(
        "productsSearchForm"
      );

    const searchInput =
      document.getElementById(
        "productsSearchInput"
      );

    const categoryButtons =
      document.querySelectorAll(
        ".category-item"
      );

    if (!catalogGrid) {
      console.error(
        "catalogGrid element was not found."
      );

      return;
    }

    /* =================================
       SETTINGS
    ================================= */

    const categoryTitles = {
      all: "All Products",
      pooja: "Pooja Items",
      kitchen: "Kitchen Items",
      idols: "Brass Idols",
      decor: "Home Décor",
      gifting: "Gifting"
    };

    const urlParameters =
      new URLSearchParams(
        window.location.search
      );

    let activeCategory =
      urlParameters.get("category") ||
      "all";

    let activeSearch =
      urlParameters.get("search") ||
      "";

    let products = [];

    if (
      !Object.prototype.hasOwnProperty.call(
        categoryTitles,
        activeCategory
      )
    ) {
      activeCategory = "all";
    }

    /* =================================
       HELPERS
    ================================= */

    function escapeHTML(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function normalizeText(value) {
      return String(value || "")
        .toLocaleLowerCase()
        .trim()
        .replace(/\s+/g, " ")
        .replace(
          /\bganesh\b/g,
          "ganesha"
        )
        .replace(
          /\bsaraswathi\b/g,
          "saraswati"
        );
    }

    function getProductImageUrl(value) {
      const imageValue =
        String(value || "").trim();

      if (!imageValue) {
        return "images/image-placeholder.png";
      }

      if (
        imageValue.startsWith(
          "https://"
        ) ||
        imageValue.startsWith(
          "http://"
        )
      ) {
        return imageValue;
      }

      const cleanStoragePath =
        imageValue
          .replace(
            /^product-images\//,
            ""
          )
          .replace(/^\/+/, "");

      const { data } =
        supabaseClient.storage
          .from("product-images")
          .getPublicUrl(
            cleanStoragePath
          );

      return (
        data?.publicUrl ||
        "images/image-placeholder.png"
      );
    }

    /* =================================
       PAGE LOADING SHIMMER
    ================================= */

    function showLoadingShimmer() {
      catalogGrid.innerHTML = "";

      for (
        let index = 0;
        index < 18;
        index += 1
      ) {
        const skeletonCard =
          document.createElement(
            "article"
          );

        skeletonCard.className =
          "catalog-product-card catalog-skeleton-card";

        skeletonCard.innerHTML = `
          <div class="catalog-skeleton-image"></div>

          <div class="catalog-skeleton-content">
            <div class="catalog-skeleton-name"></div>
            <div class="catalog-skeleton-button"></div>
          </div>
        `;

        catalogGrid.appendChild(
          skeletonCard
        );
      }
    }

    /* =================================
       CATEGORY
    ================================= */

    function updateCategoryButtons() {
      categoryButtons.forEach(
        function (button) {
          button.classList.toggle(
            "active",
            button.dataset.category ===
              activeCategory
          );
        }
      );
    }

    function updatePageUrl() {
      const currentUrl =
        new URL(
          window.location.href
        );

      if (
        activeCategory === "all"
      ) {
        currentUrl.searchParams.delete(
          "category"
        );
      } else {
        currentUrl.searchParams.set(
          "category",
          activeCategory
        );
      }

      if (activeSearch) {
        currentUrl.searchParams.set(
          "search",
          activeSearch
        );
      } else {
        currentUrl.searchParams.delete(
          "search"
        );
      }

      window.history.replaceState(
        {},
        "",
        currentUrl
      );
    }

    /* =================================
       FILTER PRODUCTS
    ================================= */

    function getFilteredProducts() {
      return products.filter(
        function (product) {
          const categoryMatches =
            activeCategory === "all" ||
            product.category ===
              activeCategory;

          const searchableText =
            normalizeText(
              `${product.name} ${
                product.category_name ||
                ""
              }`
            );

          const searchMatches =
            activeSearch === "" ||
            searchableText.includes(
              normalizeText(
                activeSearch
              )
            );

          return (
            categoryMatches &&
            searchMatches
          );
        }
      );
    }

    /* =================================
       PRODUCT IMAGE LOADING
    ================================= */

    function setupProductImage(
      image,
      imageContainer,
      originalImageUrl
    ) {
      let fallbackUsed = false;

      function showLoadedImage() {
        imageContainer.classList.add(
          "image-loaded"
        );

        imageContainer.classList.remove(
          "image-loading"
        );
      }

      image.addEventListener(
        "load",
        showLoadedImage
      );

      image.addEventListener(
        "error",
        function () {
          console.error(
            "Unable to load product image:",
            originalImageUrl
          );

          if (!fallbackUsed) {
            fallbackUsed = true;

            image.src =
              "images/image-placeholder.png";

            return;
          }

          showLoadedImage();
        }
      );

      if (
        image.complete &&
        image.naturalWidth > 0
      ) {
        showLoadedImage();
      }
    }

    /* =================================
       CREATE PRODUCT CARD
    ================================= */

    function createProductCard(
      product
    ) {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "catalog-product-card";

      card.tabIndex = 0;

      card.setAttribute(
        "role",
        "link"
      );

      card.setAttribute(
        "aria-label",
        `View ${product.name}`
      );

      const productImageUrl =
        getProductImageUrl(
          product.image_url
        );

      card.innerHTML = `
        <div class="catalog-product-image image-loading">
          <img
            src="${escapeHTML(
              productImageUrl
            )}"
            alt="${escapeHTML(
              product.name
            )}"
            loading="lazy"
          >
        </div>

        <div class="catalog-product-info">
          <h3>
            ${escapeHTML(
              product.name
            )}
          </h3>

          <button
            class="view-product-button"
            type="button"
          >
            View Product
          </button>
        </div>
      `;

      const imageContainer =
        card.querySelector(
          ".catalog-product-image"
        );

      const image =
        card.querySelector("img");

      const viewProductButton =
        card.querySelector(
          ".view-product-button"
        );

      if (
        image &&
        imageContainer
      ) {
        setupProductImage(
          image,
          imageContainer,
          product.image_url
        );
      }

      function openProductPage() {
        window.location.href =
          `product-full.html?id=${encodeURIComponent(
            product.id
          )}`;
      }

      card.addEventListener(
        "click",
        function (event) {
          if (
            event.target.closest(
              "button"
            )
          ) {
            return;
          }

          openProductPage();
        }
      );

      card.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();

            openProductPage();
          }
        }
      );

      if (viewProductButton) {
        viewProductButton.addEventListener(
          "click",
          function (event) {
            event.stopPropagation();

            openProductPage();
          }
        );
      }

      return card;
    }

    /* =================================
       RENDER PRODUCTS
    ================================= */

    function renderProducts() {
      const filteredProducts =
        getFilteredProducts();

      catalogGrid.innerHTML = "";

      if (catalogTitle) {
        catalogTitle.textContent =
          activeSearch
            ? `Search: ${activeSearch}`
            : categoryTitles[
                activeCategory
              ];
      }

      if (searchInput) {
        searchInput.value =
          activeSearch;
      }

      if (
        filteredProducts.length === 0
      ) {
        if (catalogMessage) {
          catalogMessage.textContent =
            activeSearch
              ? `No products found for "${activeSearch}".`
              : "No products are available in this category.";
        }

        return;
      }

      if (catalogMessage) {
        catalogMessage.textContent =
          "";
      }

      filteredProducts.forEach(
        function (product) {
          const productCard =
            createProductCard(
              product
            );

          catalogGrid.appendChild(
            productCard
          );
        }
      );
    }

    /* =================================
       LOAD DATABASE PRODUCTS
    ================================= */

    async function loadProducts() {
      showLoadingShimmer();

      if (catalogMessage) {
        catalogMessage.textContent =
          "";
      }

      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("products")
            .select(
              `
                id,
                name,
                category,
                category_name,
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

        products = data || [];

        updateCategoryButtons();
        renderProducts();
      } catch (error) {
        console.error(
          "Unable to load products:",
          error
        );

        catalogGrid.innerHTML = "";

        if (catalogMessage) {
          catalogMessage.textContent =
            "Unable to load products. Please refresh the page.";
        }
      }
    }

    /* =================================
       CATEGORY BUTTON EVENTS
    ================================= */

    categoryButtons.forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            activeCategory =
              button.dataset.category ||
              "all";

            activeSearch = "";

            updateCategoryButtons();
            updatePageUrl();
            renderProducts();
          }
        );
      }
    );

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

          activeSearch =
            searchInput.value.trim();

          activeCategory = "all";

          updateCategoryButtons();
          updatePageUrl();
          renderProducts();
        }
      );

      searchInput.addEventListener(
        "input",
        function () {
          if (
            catalogMessage
          ) {
            catalogMessage.textContent =
              "";
          }
        }
      );
    }

    await loadProducts();
  }
);
