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

    const searchSuggestions =
      document.getElementById(
        "productsSearchSuggestions"
      );

    const searchSuggestionsList =
      document.getElementById(
        "productsSearchSuggestionsList"
      );

    const searchSuggestionsMessage =
      document.getElementById(
        "productsSearchSuggestionsMessage"
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

    let searchDelayTimer = null;

    if (
      !Object.prototype
        .hasOwnProperty.call(
          categoryTitles,
          activeCategory
        )
    ) {
      activeCategory = "all";
    }

    /* =================================
       GENERAL HELPERS
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

    function formatPrice(value) {
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }
      ).format(
        Number(value) || 0
      );
    }

    function getProductImageUrl(
      value
    ) {
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

      if (
        typeof supabaseClient ===
        "undefined"
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
       PRODUCT VALUE HELPERS
    ================================= */

    function getProductPrice(
      product
    ) {
      return (
        Number(
          product.price ||
          product.sale_price ||
          product.final_price ||
          0
        ) || 0
      );
    }

    function getProductOldPrice(
      product,
      currentPrice
    ) {
      let oldPrice =
        Number(
          product.old_price ||
          product.oldPrice ||
          product.original_price ||
          product.mrp ||
          currentPrice
        ) || currentPrice;

      if (
        oldPrice <= 0 ||
        oldPrice < currentPrice
      ) {
        oldPrice = currentPrice;
      }

      return oldPrice;
    }

    function calculateDiscount(
      currentPrice,
      oldPrice
    ) {
      if (
        currentPrice <= 0 ||
        oldPrice <= currentPrice
      ) {
        return 0;
      }

      return Math.round(
        (
          (
            oldPrice -
            currentPrice
          ) /
          oldPrice
        ) *
        100
      );
    }

    function getProductDiscount(
      product,
      currentPrice,
      oldPrice
    ) {
      const savedDiscount =
        Number(
          product.discount ||
          product.discount_percentage ||
          product.discount_percent ||
          0
        );

      if (savedDiscount > 0) {
        return Math.round(
          savedDiscount
        );
      }

      return calculateDiscount(
        currentPrice,
        oldPrice
      );
    }

    function getProductRating(
      product
    ) {
      const rating =
        Number(
          product.rating ||
          product.average_rating ||
          4.3
        );

      if (
        !Number.isFinite(rating) ||
        rating <= 0
      ) {
        return 4.3;
      }

      return Math.min(
        Math.max(
          rating,
          1
        ),
        5
      );
    }

    function getCategoryName(
      product
    ) {
      return (
        product.category_name ||
        categoryTitles[
          product.category
        ] ||
        "Ajjaram Brass"
      );
    }

    function openProductPage(
      productId
    ) {
      if (!productId) {
        return;
      }

      window.location.href =
        `product-full.html?id=${encodeURIComponent(
          productId
        )}`;
    }

    /* =================================
       LIVE SEARCH DROPDOWN
    ================================= */

    function openSearchSuggestions() {
      if (
        !searchSuggestions ||
        !searchInput
      ) {
        return;
      }

      searchSuggestions.hidden =
        false;

      searchInput.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    function closeSearchSuggestions() {
      if (
        !searchSuggestions ||
        !searchInput
      ) {
        return;
      }

      searchSuggestions.hidden =
        true;

      searchInput.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    function clearSearchSuggestions() {
      if (searchSuggestionsList) {
        searchSuggestionsList.innerHTML =
          "";
      }

      if (searchSuggestionsMessage) {
        searchSuggestionsMessage
          .textContent = "";

        searchSuggestionsMessage
          .classList.remove(
            "error"
          );
      }
    }

    function showSearchMessage(
      message,
      isError = false
    ) {
      if (searchSuggestionsList) {
        searchSuggestionsList.innerHTML =
          "";
      }

      if (!searchSuggestionsMessage) {
        return;
      }

      searchSuggestionsMessage.textContent =
        message || "";

      searchSuggestionsMessage.classList
        .toggle(
          "error",
          Boolean(isError)
        );
    }

    function getLiveSearchMatches(
      searchValue
    ) {
      const normalizedSearch =
        normalizeText(
          searchValue
        );

      if (!normalizedSearch) {
        return [];
      }

      return products
        .filter(
          function (product) {
            const searchableText =
              normalizeText(
                `
                  ${product.name || ""}
                  ${product.category || ""}
                  ${product.category_name || ""}
                  ${product.short_description || ""}
                `
              );

            return searchableText.includes(
              normalizedSearch
            );
          }
        )
        .slice(0, 10);
    }

    function renderSearchSuggestions(
      matchingProducts
    ) {
      if (
        !searchSuggestionsList ||
        !searchSuggestionsMessage
      ) {
        return;
      }

      clearSearchSuggestions();

      if (
        !Array.isArray(
          matchingProducts
        ) ||
        matchingProducts.length === 0
      ) {
        showSearchMessage(
          "No products found."
        );

        return;
      }

      matchingProducts.forEach(
        function (product) {
          const productName =
            product.name ||
            "Brass Product";

          const categoryName =
            getCategoryName(
              product
            );

          const imageUrl =
            getProductImageUrl(
              product.image_url
            );

          const resultButton =
            document.createElement(
              "button"
            );

          resultButton.type =
            "button";

          resultButton.className =
            "search-suggestion-item";

          resultButton.innerHTML = `
            <span class="search-suggestion-image">
              <img
                src="${escapeHTML(
                  imageUrl
                )}"
                alt="${escapeHTML(
                  productName
                )}"
                loading="lazy"
              >
            </span>

            <span class="search-suggestion-content">

              <strong>
                ${escapeHTML(
                  productName
                )}
              </strong>

              <small>
                ${escapeHTML(
                  categoryName
                )}
              </small>

            </span>
          `;

          const resultImage =
            resultButton.querySelector(
              "img"
            );

          resultImage?.addEventListener(
            "error",
            function () {
              resultImage.src =
                "images/image-placeholder.png";
            },
            {
              once: true
            }
          );

          resultButton.addEventListener(
            "click",
            function () {
              openProductPage(
                product.id
              );
            }
          );

          searchSuggestionsList
            .appendChild(
              resultButton
            );
        }
      );
    }

    function performLiveSearch(
      searchValue
    ) {
      const value =
        String(searchValue || "")
          .trim();

      if (!value) {
        clearSearchSuggestions();
        closeSearchSuggestions();

        return;
      }

      openSearchSuggestions();

      if (products.length === 0) {
        showSearchMessage(
          "Loading products..."
        );

        return;
      }

      const matchingProducts =
        getLiveSearchMatches(
          value
        );

      renderSearchSuggestions(
        matchingProducts
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
            <div class="catalog-skeleton-price"></div>
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
              `
                ${product.name || ""}
                ${product.category || ""}
                ${product.category_name || ""}
                ${product.short_description || ""}
              `
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

      const productName =
        product.name ||
        "Brass Product";

      card.setAttribute(
        "aria-label",
        `Open ${productName}`
      );

      const productImageUrl =
        getProductImageUrl(
          product.image_url ||
          product.image ||
          product.imageUrl
        );

      const currentPrice =
        getProductPrice(
          product
        );

      const oldPrice =
        getProductOldPrice(
          product,
          currentPrice
        );

      const discount =
        getProductDiscount(
          product,
          currentPrice,
          oldPrice
        );

      const rating =
        getProductRating(
          product
        );

      const oldPriceHTML =
        oldPrice > currentPrice
          ? `
            <span class="catalog-product-old-price">
              ${formatPrice(
                oldPrice
              )}
            </span>
          `
          : "";

      const discountHTML =
        discount > 0
          ? `
            <span class="catalog-product-discount">
              ${discount}% OFF
            </span>
          `
          : "";

      card.innerHTML = `
        <div class="catalog-product-image image-loading">

          <img
            src="${escapeHTML(
              productImageUrl
            )}"
            alt="${escapeHTML(
              productName
            )}"
            loading="lazy"
          >

          <span class="catalog-product-rating">
            ★ ${rating.toFixed(1)}
          </span>

        </div>

        <div class="catalog-product-info">

          <h3 class="catalog-product-name">
            ${escapeHTML(
              productName
            )}
          </h3>

          <div class="catalog-product-price-row">

            <strong class="catalog-product-price">
              ${formatPrice(
                currentPrice
              )}
            </strong>

            ${oldPriceHTML}

            ${discountHTML}

          </div>

        </div>
      `;

      const imageContainer =
        card.querySelector(
          ".catalog-product-image"
        );

      const image =
        card.querySelector(
          "img"
        );

      if (
        image &&
        imageContainer
      ) {
        setupProductImage(
          image,
          imageContainer,
          product.image_url ||
          product.image ||
          product.imageUrl
        );
      }

      card.addEventListener(
        "click",
        function () {
          openProductPage(
            product.id
          );
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

            openProductPage(
              product.id
            );
          }
        }
      );

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
          catalogGrid.appendChild(
            createProductCard(
              product
            )
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

      if (
        typeof supabaseClient ===
        "undefined"
      ) {
        catalogGrid.innerHTML = "";

        if (catalogMessage) {
          catalogMessage.textContent =
            "Supabase is not connected.";
        }

        return;
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
                price,
                old_price,
                discount,
                rating,
                short_description,
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

        products =
          Array.isArray(data)
            ? data
            : [];

        updateCategoryButtons();

        renderProducts();

        if (
          searchInput?.value.trim()
        ) {
          performLiveSearch(
            searchInput.value
          );
        }
      } catch (error) {
        console.error(
          "Unable to load products:",
          error
        );

        catalogGrid.innerHTML = "";

        if (catalogMessage) {
          const lowerMessage =
            String(
              error?.message || ""
            ).toLowerCase();

          if (
            lowerMessage.includes(
              "column"
            ) &&
            lowerMessage.includes(
              "does not exist"
            )
          ) {
            catalogMessage.textContent =
              "A required products-table column is missing.";
          } else {
            catalogMessage.textContent =
              "Unable to load products. Please refresh the page.";
          }
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

            if (searchInput) {
              searchInput.value = "";
            }

            closeSearchSuggestions();
            clearSearchSuggestions();

            updateCategoryButtons();
            updatePageUrl();
            renderProducts();
          }
        );
      }
    );

    /* =================================
       SEARCH EVENTS
    ================================= */

    if (
      searchForm &&
      searchInput
    ) {
      searchInput.addEventListener(
        "input",
        function () {
          const value =
            searchInput.value.trim();

          window.clearTimeout(
            searchDelayTimer
          );

          if (catalogMessage) {
            catalogMessage.textContent =
              "";
          }

          if (!value) {
            closeSearchSuggestions();
            clearSearchSuggestions();

            return;
          }

          openSearchSuggestions();

          showSearchMessage(
            "Searching..."
          );

          searchDelayTimer =
            window.setTimeout(
              function () {
                performLiveSearch(
                  value
                );
              },
              180
            );
        }
      );

      searchForm.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          activeSearch =
            searchInput.value.trim();

          activeCategory = "all";

          closeSearchSuggestions();

          updateCategoryButtons();
          updatePageUrl();
          renderProducts();
        }
      );

      searchInput.addEventListener(
        "focus",
        function () {
          const value =
            searchInput.value.trim();

          if (value) {
            performLiveSearch(
              value
            );
          }
        }
      );

      searchInput.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Escape"
          ) {
            closeSearchSuggestions();
            clearSearchSuggestions();

            searchInput.value = "";
            searchInput.focus();
          }

          if (
            event.key === "ArrowDown"
          ) {
            const firstResult =
              searchSuggestionsList
                ?.querySelector(
                  ".search-suggestion-item"
                );

            if (firstResult) {
              event.preventDefault();

              firstResult.focus();
            }
          }
        }
      );
    }

    /* Keyboard navigation */

    searchSuggestionsList
      ?.addEventListener(
        "keydown",
        function (event) {
          const resultItems =
            Array.from(
              searchSuggestionsList
                .querySelectorAll(
                  ".search-suggestion-item"
                )
            );

          const currentIndex =
            resultItems.indexOf(
              document.activeElement
            );

          if (
            event.key === "ArrowDown"
          ) {
            event.preventDefault();

            const nextIndex =
              Math.min(
                currentIndex + 1,
                resultItems.length - 1
              );

            resultItems[
              nextIndex
            ]?.focus();
          }

          if (
            event.key === "ArrowUp"
          ) {
            event.preventDefault();

            if (currentIndex <= 0) {
              searchInput?.focus();

              return;
            }

            resultItems[
              currentIndex - 1
            ]?.focus();
          }

          if (
            event.key === "Escape"
          ) {
            closeSearchSuggestions();

            searchInput?.focus();
          }
        }
      );

    /* Close dropdown outside */

    document.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.closest(
            ".header-search-wrapper"
          )
        ) {
          closeSearchSuggestions();
        }
      }
    );

    await loadProducts();
  }
);
