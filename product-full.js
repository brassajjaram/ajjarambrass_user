document.addEventListener(
  "DOMContentLoaded",
  async function () {
    /* =================================
       HTML ELEMENTS
    ================================= */

    const productSlideImages =
      Array.from(
        document.querySelectorAll(
          ".product-slide-image"
        )
      );

    const productSlider =
      document.getElementById(
        "productSlider"
      );

    const productSliderTrack =
      document.getElementById(
        "productSliderTrack"
      );

    const productSliderDots =
      Array.from(
        document.querySelectorAll(
          ".product-slider-dot"
        )
      );

    const productName =
      document.getElementById(
        "productName"
      );

    const productCategory =
      document.getElementById(
        "productCategory"
      );

    const productDescription =
      document.getElementById(
        "productDescription"
      );

    const productShortDescription =
      document.getElementById(
        "productShortDescription"
      );

    const productPrice =
      document.getElementById(
        "productPrice"
      );

    const productOldPrice =
      document.getElementById(
        "productOldPrice"
      );

    const productDiscount =
      document.getElementById(
        "productDiscount"
      );

    const productRating =
      document.getElementById(
        "productRating"
      );

    const addToCartButton =
      document.getElementById(
        "productAddToCart"
      );

    const quantityControl =
      document.getElementById(
        "productQuantityControl"
      );

    const quantityValue =
      document.getElementById(
        "productQuantity"
      );

    const decreaseButton =
      document.getElementById(
        "decreaseQuantity"
      );

    const increaseButton =
      document.getElementById(
        "increaseQuantity"
      );

    const productCartIcon =
      document.getElementById(
        "productCartIcon"
      );

    const cartItemCount =
      document.getElementById(
        "cartItemCount"
      );

    const productPageLoader =
      document.getElementById(
        "productPageLoader"
      );

    /* =================================
       PAGE SHIMMER
    ================================= */

    const minimumShimmerTime = 2000;

    const pageLoadingStartedAt =
      Date.now();

    let pageLoaderFinished = false;

    function finishProductPageLoading() {
      if (pageLoaderFinished) {
        return;
      }

      pageLoaderFinished = true;

      const elapsedTime =
        Date.now() -
        pageLoadingStartedAt;

      const remainingTime =
        Math.max(
          minimumShimmerTime -
            elapsedTime,
          0
        );

      window.setTimeout(
        function () {
          if (productPageLoader) {
            productPageLoader.classList.add(
              "is-hidden"
            );
          }

          if (
            typeof window.finishPageLoading ===
            "function"
          ) {
            window.finishPageLoading();
          }
        },
        remainingTime
      );
    }

    /* Safety fallback */

    window.setTimeout(
      finishProductPageLoading,
      7000
    );

    /* =================================
       HELPERS
    ================================= */

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

    function getCart() {
      try {
        const savedCart =
          localStorage.getItem(
            "ajjaramCart"
          );

        const parsedCart =
          savedCart
            ? JSON.parse(savedCart)
            : [];

        return Array.isArray(
          parsedCart
        )
          ? parsedCart
          : [];
      } catch (error) {
        console.error(
          "Unable to read cart:",
          error
        );

        return [];
      }
    }

    function saveCart(cart) {
      try {
        localStorage.setItem(
          "ajjaramCart",
          JSON.stringify(cart)
        );
      } catch (error) {
        console.error(
          "Unable to save cart:",
          error
        );
      }
    }

    /* =================================
       PRODUCT ID
    ================================= */

    const parameters =
      new URLSearchParams(
        window.location.search
      );

    const productId =
      Number(
        parameters.get("id")
      );

    if (!productId) {
      finishProductPageLoading();

      window.setTimeout(
        function () {
          window.location.href =
            "products.html";
        },
        300
      );

      return;
    }
    sessionStorage.setItem(
  "ajjaramLastProductUrl",
  window.location.href
);

    /* =================================
       LOAD PRODUCT FROM SUPABASE
    ================================= */

    let selectedProduct;

    try {
      const {
        data,
        error
      } =
        await supabaseClient
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq(
            "is_active",
            true
          )
          .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Product was not found."
        );
      }

      selectedProduct = data;
    } catch (error) {
      console.error(
        "Unable to load product:",
        error
      );

      finishProductPageLoading();

      window.setTimeout(
        function () {
          window.location.href =
            "products.html";
        },
        500
      );

      return;
    }

    document.title =
      `${selectedProduct.name} | Ajjaram Brass`;

    /* =================================
       PRODUCT IMAGES
    ================================= */

    const productImages = [
      selectedProduct.image_url,
      selectedProduct.image_url_2,
      selectedProduct.image_url_3
    ]
      .filter(Boolean)
      .map(getProductImageUrl);

    if (
      productImages.length === 0
    ) {
      productImages.push(
        "images/image-placeholder.png"
      );
    }

    const imageLoadingPromises = [];

    productSlideImages.forEach(
      function (image, index) {
        const slide =
          image.closest(
            ".product-slide"
          );

        const imageUrl =
          productImages[index] ||
          productImages[0];

        image.alt =
          `${selectedProduct.name} image ${
            index + 1
          }`;

        const imageLoadingPromise =
          new Promise(
            function (resolve) {
              let completed = false;
              let fallbackUsed = false;

              function finishImage() {
                if (completed) {
                  return;
                }

                completed = true;

                if (slide) {
                  slide.classList.add(
                    "image-loaded"
                  );
                }

                resolve();
              }

              function handleImageError() {
                console.error(
                  "Product slider image failed:",
                  image.src
                );

                if (!fallbackUsed) {
                  fallbackUsed = true;

                  image.src =
                    "images/image-placeholder.png";

                  return;
                }

                finishImage();
              }

              image.addEventListener(
                "load",
                finishImage,
                {
                  once: true
                }
              );

              image.addEventListener(
                "error",
                handleImageError
              );

              image.src = imageUrl;

              if (
                image.complete &&
                image.naturalWidth > 0
              ) {
                finishImage();
              }

              window.setTimeout(
                finishImage,
                6000
              );
            }
          );

        imageLoadingPromises.push(
          imageLoadingPromise
        );
      }
    );

    /* =================================
       PRODUCT INFORMATION
    ================================= */

    if (productName) {
      productName.textContent =
        selectedProduct.name ||
        "";
    }

    if (productCategory) {
      productCategory.textContent =
        selectedProduct.category_name ||
        selectedProduct.category ||
        "";
    }

    if (productDescription) {
      productDescription.textContent =
        selectedProduct.description ||
        "";
    }

    if (
      productShortDescription
    ) {
      productShortDescription.textContent =
        selectedProduct.short_description ||
        selectedProduct.description ||
        "";
    }

    if (productPrice) {
      productPrice.textContent =
        formatPrice(
          selectedProduct.price
        );
    }

    const oldPrice =
      Number(
        selectedProduct.old_price ||
        0
      );

    const currentPrice =
      Number(
        selectedProduct.price ||
        0
      );

    if (productOldPrice) {
      if (
        oldPrice >
        currentPrice
      ) {
        productOldPrice.textContent =
          formatPrice(oldPrice);

        productOldPrice.hidden =
          false;
      } else {
        productOldPrice.hidden =
          true;
      }
    }

    const discount =
      Number(
        selectedProduct.discount ||
        0
      );

    if (productDiscount) {
      if (discount > 0) {
        productDiscount.textContent =
          `${discount}% OFF`;

        productDiscount.hidden =
          false;
      } else {
        productDiscount.hidden =
          true;
      }
    }

    if (productRating) {
      productRating.textContent =
        Number(
          selectedProduct.rating ||
          0
        ).toFixed(1);
    }

    /* =================================
       MANUAL IMAGE SLIDER
    ================================= */

    let currentSlide = 0;

    let touchStartX = 0;
    let touchCurrentX = 0;
    let isTouching = false;

    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isMouseDragging = false;

    function getTotalSlides() {
      return productSlideImages.length;
    }

    function updateSlider(
      animate = true
    ) {
      if (!productSliderTrack) {
        return;
      }

      productSliderTrack.style.transition =
        animate
          ? "transform 0.45s ease"
          : "none";

      productSliderTrack.style.transform =
        `translateX(-${
          currentSlide * 100
        }%)`;

      productSliderDots.forEach(
        function (dot, index) {
          const isActive =
            index === currentSlide;

          dot.classList.toggle(
            "active",
            isActive
          );

          dot.setAttribute(
            "aria-current",
            isActive
              ? "true"
              : "false"
          );
        }
      );
    }

    function goToSlide(index) {
      const totalSlides =
        getTotalSlides();

      if (totalSlides === 0) {
        return;
      }

      currentSlide =
        Math.max(
          0,
          Math.min(
            index,
            totalSlides - 1
          )
        );

      updateSlider(true);
    }

    function moveSliderWhileDragging(
      distance
    ) {
      if (
        !productSlider ||
        !productSliderTrack
      ) {
        return;
      }

      const sliderWidth =
        productSlider.offsetWidth;

      if (sliderWidth <= 0) {
        return;
      }

      const dragPercentage =
        (
          distance /
          sliderWidth
        ) * 100;

      const basePosition =
        currentSlide * -100;

      let nextPosition =
        basePosition +
        dragPercentage;

      const lastSlide =
        getTotalSlides() - 1;

      /*
       * Resistance at first image.
       */

      if (
        currentSlide === 0 &&
        distance > 0
      ) {
        nextPosition =
          basePosition +
          dragPercentage * 0.25;
      }

      /*
       * Resistance at last image.
       */

      if (
        currentSlide ===
          lastSlide &&
        distance < 0
      ) {
        nextPosition =
          basePosition +
          dragPercentage * 0.25;
      }

      productSliderTrack.style.transform =
        `translateX(${nextPosition}%)`;
    }

    function finishDragging(
      distance
    ) {
      if (!productSlider) {
        return;
      }

      const threshold =
        Math.max(
          45,
          productSlider.offsetWidth *
            0.12
        );

      if (
        distance <
          -threshold &&
        currentSlide <
          getTotalSlides() - 1
      ) {
        currentSlide += 1;
      } else if (
        distance >
          threshold &&
        currentSlide > 0
      ) {
        currentSlide -= 1;
      }

      updateSlider(true);
    }

    /* Slider dots */

    productSliderDots.forEach(
      function (dot) {
        dot.addEventListener(
          "click",
          function () {
            const selectedSlide =
              Number(
                dot.dataset.slide
              );

            if (
              Number.isInteger(
                selectedSlide
              )
            ) {
              goToSlide(
                selectedSlide
              );
            }
          }
        );
      }
    );

    /* Mobile touch sliding */

    if (
      productSlider &&
      productSliderTrack
    ) {
      productSlider.addEventListener(
        "touchstart",
        function (event) {
          if (
            event.touches.length !== 1
          ) {
            return;
          }

          isTouching = true;

          touchStartX =
            event.touches[0]
              .clientX;

          touchCurrentX =
            touchStartX;

          productSliderTrack.style.transition =
            "none";
        },
        {
          passive: true
        }
      );

      productSlider.addEventListener(
        "touchmove",
        function (event) {
          if (
            !isTouching ||
            event.touches.length !== 1
          ) {
            return;
          }

          touchCurrentX =
            event.touches[0]
              .clientX;

          const distance =
            touchCurrentX -
            touchStartX;

          moveSliderWhileDragging(
            distance
          );
        },
        {
          passive: true
        }
      );

      productSlider.addEventListener(
        "touchend",
        function () {
          if (!isTouching) {
            return;
          }

          isTouching = false;

          const distance =
            touchCurrentX -
            touchStartX;

          finishDragging(
            distance
          );
        }
      );

      productSlider.addEventListener(
        "touchcancel",
        function () {
          isTouching = false;
          updateSlider(true);
        }
      );
    }

    /* PC mouse dragging */

    if (
      productSlider &&
      productSliderTrack
    ) {
      productSlider.addEventListener(
        "mousedown",
        function (event) {
          if (event.button !== 0) {
            return;
          }

          isMouseDragging = true;

          mouseStartX =
            event.clientX;

          mouseCurrentX =
            mouseStartX;

          productSliderTrack.style.transition =
            "none";

          productSlider.classList.add(
            "is-dragging"
          );

          event.preventDefault();
        }
      );

      window.addEventListener(
        "mousemove",
        function (event) {
          if (!isMouseDragging) {
            return;
          }

          mouseCurrentX =
            event.clientX;

          const distance =
            mouseCurrentX -
            mouseStartX;

          moveSliderWhileDragging(
            distance
          );
        }
      );

      window.addEventListener(
        "mouseup",
        function () {
          if (!isMouseDragging) {
            return;
          }

          isMouseDragging = false;

          productSlider.classList.remove(
            "is-dragging"
          );

          const distance =
            mouseCurrentX -
            mouseStartX;

          finishDragging(
            distance
          );
        }
      );

      productSlider.addEventListener(
        "mouseleave",
        function () {
          if (!isMouseDragging) {
            return;
          }

          isMouseDragging = false;

          productSlider.classList.remove(
            "is-dragging"
          );

          const distance =
            mouseCurrentX -
            mouseStartX;

          finishDragging(
            distance
          );
        }
      );
    }

    /*
     * Start at image one.
     * There is no automatic timer.
     */

    updateSlider(false);

    /* =================================
       CART
    ================================= */

    function getSelectedCartItem() {
      return getCart().find(
        function (item) {
          return (
            Number(item.id) ===
            Number(
              selectedProduct.id
            )
          );
        }
      );
    }

    function updateCartDisplay() {
      const cart = getCart();

      const selectedCartItem =
        getSelectedCartItem();

      const totalQuantity =
        cart.reduce(
          function (
            total,
            item
          ) {
            return (
              total +
              Number(
                item.quantity ||
                0
              )
            );
          },
          0
        );

      if (cartItemCount) {
        cartItemCount.textContent =
          totalQuantity;
      }

      if (productCartIcon) {
        productCartIcon.hidden =
          totalQuantity <= 0;
      }

      if (
        selectedCartItem &&
        Number(
          selectedCartItem.quantity
        ) > 0
      ) {
        if (addToCartButton) {
          addToCartButton.hidden =
            true;
        }

        if (quantityControl) {
          quantityControl.hidden =
            false;
        }

        if (quantityValue) {
          quantityValue.textContent =
            selectedCartItem.quantity;
        }
      } else {
        if (addToCartButton) {
          addToCartButton.hidden =
            false;
        }

        if (quantityControl) {
          quantityControl.hidden =
            true;
        }
      }
    }

    function addProductToCart() {
      const cart = getCart();

      const existingItem =
        cart.find(
          function (item) {
            return (
              Number(item.id) ===
              Number(
                selectedProduct.id
              )
            );
          }
        );

      if (existingItem) {
        existingItem.quantity =
          Number(
            existingItem.quantity ||
            0
          ) + 1;
      } else {
        cart.push({
          id:
            selectedProduct.id,

          name:
            selectedProduct.name,

          categoryName:
            selectedProduct.category_name,

          image:
            getProductImageUrl(
              selectedProduct.image_url
            ),

          price:
            Number(
              selectedProduct.price ||
              0
            ),

          oldPrice:
            Number(
              selectedProduct.old_price ||
              selectedProduct.price ||
              0
            ),

          discount:
            Number(
              selectedProduct.discount ||
              0
            ),

          quantity: 1
        });
      }

      saveCart(cart);
      updateCartDisplay();
    }

    function changeQuantity(amount) {
      const cart = getCart();

      const itemIndex =
        cart.findIndex(
          function (item) {
            return (
              Number(item.id) ===
              Number(
                selectedProduct.id
              )
            );
          }
        );

      if (itemIndex === -1) {
        return;
      }

      cart[itemIndex].quantity =
        Number(
          cart[itemIndex]
            .quantity || 0
        ) + amount;

      if (
        cart[itemIndex]
          .quantity <= 0
      ) {
        cart.splice(
          itemIndex,
          1
        );
      }

      saveCart(cart);
      updateCartDisplay();
    }

    if (addToCartButton) {
      addToCartButton.addEventListener(
        "click",
        addProductToCart
      );
    }

    if (decreaseButton) {
      decreaseButton.addEventListener(
        "click",
        function () {
          changeQuantity(-1);
        }
      );
    }

    if (increaseButton) {
      increaseButton.addEventListener(
        "click",
        function () {
          changeQuantity(1);
        }
      );
    }

    updateCartDisplay();

    /* =================================
       FINISH LOADING
    ================================= */

    await Promise.allSettled(
      imageLoadingPromises
    );

    finishProductPageLoading();
  }
);
