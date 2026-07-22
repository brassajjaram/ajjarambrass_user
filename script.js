document.addEventListener(
  "DOMContentLoaded",
  function () {
    /* =================================
       GENERAL ELEMENTS
    ================================= */

    const searchForm =
      document.getElementById(
        "searchForm"
      );

    const searchInput =
      document.getElementById(
        "searchInput"
      );

    const profileButton =
      document.getElementById(
        "profileButton"
      );

    const siteFooter =
      document.getElementById(
        "siteFooter"
      );

    const footerToggle =
      document.getElementById(
        "footerToggle"
      );

    const footerToggleIcon =
      document.querySelector(
        ".footer-toggle-icon"
      );

    const currentYearElements =
      document.querySelectorAll(
        ".current-year"
      );

    const backToTop =
      document.getElementById(
        "backToTop"
      );

    /* =================================
       IMAGE SHIMMER
    ================================= */

    function setupImageLoading() {
      const imageContainers =
        document.querySelectorAll(
          `
            .desktop-banner,
            .small-banner,
            .product-image
          `
        );

      const minimumShimmerTime = 900;
      const startTime = Date.now();

      imageContainers.forEach(
        function (container) {
          const image =
            container.querySelector(
              "img"
            );

          if (!image) {
            container.classList.add(
              "image-loaded"
            );

            return;
          }

          function removeShimmer() {
            const elapsedTime =
              Date.now() -
              startTime;

            const remainingTime =
              Math.max(
                minimumShimmerTime -
                elapsedTime,
                0
              );

            window.setTimeout(
              function () {
                container.classList.add(
                  "image-loaded"
                );
              },
              remainingTime
            );
          }

          if (
            image.complete &&
            image.naturalWidth > 0
          ) {
            removeShimmer();
          } else {
            image.addEventListener(
              "load",
              removeShimmer,
              {
                once: true
              }
            );

            image.addEventListener(
              "error",
              removeShimmer,
              {
                once: true
              }
            );
          }
        }
      );
    }

    setupImageLoading();

    /* =================================
       FOOTER
    ================================= */

    currentYearElements.forEach(
      function (element) {
        element.textContent =
          new Date().getFullYear();
      }
    );

    if (
      siteFooter &&
      footerToggle &&
      footerToggleIcon
    ) {
      footerToggle.addEventListener(
        "click",
        function () {
          const isOpen =
            siteFooter.classList.toggle(
              "footer-open"
            );

          footerToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
          );

          footerToggle.setAttribute(
            "aria-label",
            isOpen
              ? "Close footer"
              : "Open footer"
          );

          footerToggleIcon.textContent =
            isOpen
              ? "−"
              : "+";
        }
      );
    }

    backToTop?.addEventListener(
      "click",
      function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

    /* =================================
       HOMEPAGE SEARCH
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

      searchInput.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Escape"
          ) {
            searchInput.value = "";
            searchInput.focus();
          }
        }
      );
    }

    /* =================================
       PRODUCT CARD NAVIGATION
    ================================= */

    const productCategoryMap = {
      "Brass Pooja Lamp":
        "pooja",

      "Brass Pooja Bell":
        "pooja",

      "Incense Holder":
        "pooja",

      "Brass Kalash":
        "pooja",

      "Lotus Diya":
        "pooja",

      "Pooja Plate":
        "pooja",

      "Candle Holder":
        "decor",

      "Flower Vase":
        "decor",

      "Brass Lantern":
        "decor",

      "Decorative Bowl":
        "decor",

      "Brass Swan Pair":
        "decor",

      "Brass Elephant":
        "decor",

      "Wall Hanging":
        "decor",

      "Brass Urli":
        "decor",

      "Ganesha Idol":
        "idols",

      "Lakshmi Idol":
        "idols",

      "Balaji Idol":
        "idols",

      "Saraswati Idol":
        "idols",

      "Hanuman Idol":
        "idols",

      "Nataraja Idol":
        "idols",

      "Krishna Idol":
        "idols",

      "Brass Glass":
        "kitchen",

      "Brass Water Jug":
        "kitchen",

      "Brass Plate":
        "kitchen",

      "Serving Bowl":
        "kitchen",

      "Brass Spoon Set":
        "kitchen",

      "Brass Dinner Set":
        "kitchen",

      "Storage Box":
        "gifting",

      "Brass Peacock":
        "gifting",

      "Brass Tortoise":
        "gifting",

      "Door Bell":
        "gifting",

      "Brass Temple":
        "gifting",

      "Brass Conch":
        "gifting",

      "Brass Chakra":
        "gifting",

      "Decorative Stand":
        "gifting"
    };

    function openProductCard(card) {
      if (!card) {
        return;
      }

      const productName =
        card.querySelector(
          "h3"
        )?.textContent.trim() || "";

      const category =
        card.dataset.category ||
        productCategoryMap[
          productName
        ] ||
        "all";

      const productId =
        card.dataset.productId ||
        card.dataset.id ||
        "";

      const parameters =
        new URLSearchParams();

      parameters.set(
        "category",
        category
      );

      if (productName) {
        parameters.set(
          "product",
          productName
        );
      }

      if (productId) {
        parameters.set(
          "id",
          productId
        );
      }

      window.location.href =
        "products.html?" +
        parameters.toString();
    }

    /*
     * Uses event delegation because
     * product cards may be loaded later
     * by index-products.js.
     */

    document.addEventListener(
      "click",
      function (event) {
        const card =
          event.target.closest(
            ".product-card"
          );

        if (!card) {
          return;
        }

        /*
         * Do not redirect when clicking
         * an actual button or link inside
         * the product card.
         */

        if (
          event.target.closest(
            "button, a"
          )
        ) {
          return;
        }

        openProductCard(card);
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {
        const card =
          event.target.closest?.(
            ".product-card"
          );

        if (!card) {
          return;
        }

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openProductCard(card);
        }
      }
    );

    /*
     * Make currently available cards
     * keyboard accessible.
     */

    function prepareProductCards() {
      document
        .querySelectorAll(
          ".product-card"
        )
        .forEach(
          function (card) {
            if (
              !card.hasAttribute(
                "tabindex"
              )
            ) {
              card.setAttribute(
                "tabindex",
                "0"
              );
            }

            if (
              !card.hasAttribute(
                "role"
              )
            ) {
              card.setAttribute(
                "role",
                "link"
              );
            }
          }
        );
    }

    prepareProductCards();

    /*
     * Detect product cards inserted by
     * index-products.js.
     */

    const productsGrid =
      document.getElementById(
        "productsGrid"
      );

    if (productsGrid) {
      const productsObserver =
        new MutationObserver(
          function () {
            prepareProductCards();
            setupImageLoading();
          }
        );

      productsObserver.observe(
        productsGrid,
        {
          childList: true,
          subtree: true
        }
      );
    }

    /* =================================
       PROFILE ELEMENTS
    ================================= */

    const profileBottomSheet =
      document.getElementById(
        "profileBottomSheet"
      );

    const profileSheetOverlay =
      document.getElementById(
        "profileSheetOverlay"
      );

    const profileSheetClose =
      document.getElementById(
        "profileSheetClose"
      );

    const profileSheetLoading =
      document.getElementById(
        "profileSheetLoading"
      );

    const profileUserContent =
      document.getElementById(
        "profileUserContent"
      );

    const profileGuestContent =
      document.getElementById(
        "profileGuestContent"
      );

    const profileAvatarLetter =
      document.getElementById(
        "profileAvatarLetter"
      );

    const profileUserName =
      document.getElementById(
        "profileUserName"
      );

    const profileUserPhone =
      document.getElementById(
        "profileUserPhone"
      );

    const profileCustomerCode =
      document.getElementById(
        "profileCustomerCode"
      );

    const profileLogoutButton =
      document.getElementById(
        "profileLogoutButton"
      );

    const profileLoginButton =
      document.getElementById(
        "profileLoginButton"
      );

    const profileSheetMessage =
      document.getElementById(
        "profileSheetMessage"
      );

    /* =================================
       PROFILE HELPERS
    ================================= */

    function showProfileMessage(
      message,
      isError = false
    ) {
      if (!profileSheetMessage) {
        return;
      }

      profileSheetMessage.textContent =
        message || "";

      profileSheetMessage.classList
        .toggle(
          "error",
          Boolean(isError)
        );
    }

    function formatProfilePhone(
      value
    ) {
      const digits =
        String(value || "")
          .replace(/\D/g, "");

      let phone = digits;

      if (
        digits.startsWith("91") &&
        digits.length === 12
      ) {
        phone = digits.slice(2);
      }

      if (
        !/^\d{10}$/.test(phone)
      ) {
        return (
          value ||
          "Not available"
        );
      }

      return (
        `+91 ${phone.slice(
          0,
          5
        )} ${phone.slice(5)}`
      );
    }

    function getMetadataName(user) {
      const metadata =
        user?.user_metadata || {};

      return (
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        "Customer"
      );
    }

    function resetProfileDisplay() {
      if (profileAvatarLetter) {
        profileAvatarLetter.textContent =
          "C";
      }

      if (profileUserName) {
        profileUserName.textContent =
          "Customer";
      }

      if (profileUserPhone) {
        profileUserPhone.textContent =
          "Not available";
      }

      if (profileCustomerCode) {
        profileCustomerCode.textContent =
          "------";
      }
    }

    /* =================================
       OPEN / CLOSE PROFILE
    ================================= */

    function openProfileSheet() {
      if (
        !profileBottomSheet ||
        !profileSheetOverlay
      ) {
        return;
      }

      profileSheetOverlay.hidden =
        false;

      requestAnimationFrame(
        function () {
          profileSheetOverlay.classList
            .add("is-visible");

          profileBottomSheet.classList
            .add("is-open");
        }
      );

      profileBottomSheet.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "profile-sheet-open"
      );

      loadProfileDetails();
    }

    function closeProfileSheet() {
      if (
        !profileBottomSheet ||
        !profileSheetOverlay
      ) {
        return;
      }

      profileSheetOverlay.classList
        .remove("is-visible");

      profileBottomSheet.classList
        .remove("is-open");

      profileBottomSheet.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "profile-sheet-open"
      );

      window.setTimeout(
        function () {
          profileSheetOverlay.hidden =
            true;
        },
        300
      );
    }

    /* =================================
       LOAD PROFILE
    ================================= */

    async function loadProfileDetails() {
      resetProfileDisplay();
      showProfileMessage("");

      if (profileSheetLoading) {
        profileSheetLoading.hidden =
          false;
      }

      if (profileUserContent) {
        profileUserContent.hidden =
          true;
      }

      if (profileGuestContent) {
        profileGuestContent.hidden =
          true;
      }

      if (
        typeof supabaseClient ===
        "undefined"
      ) {
        console.error(
          "Supabase client is not available."
        );

        if (profileSheetLoading) {
          profileSheetLoading.hidden =
            true;
        }

        if (profileGuestContent) {
          profileGuestContent.hidden =
            false;
        }

        return;
      }

      try {
        const {
          data: userData,
          error: userError
        } =
          await supabaseClient.auth
            .getUser();

        if (
          userError ||
          !userData?.user
        ) {
          if (profileSheetLoading) {
            profileSheetLoading.hidden =
              true;
          }

          if (profileGuestContent) {
            profileGuestContent.hidden =
              false;
          }

          return;
        }

        const user =
          userData.user;

        const {
          data: profile,
          error: profileError
        } =
          await supabaseClient
            .from("profiles")
            .select(
              `
                full_name,
                phone,
                customer_code,
                account_type
              `
            )
            .eq(
              "id",
              user.id
            )
            .maybeSingle();

        /*
         * Continue using metadata when a
         * profile row has not yet been
         * created. Only throw for a real
         * database error.
         */

        if (profileError) {
          console.error(
            "Profile table error:",
            profileError
          );
        }

        const metadata =
          user.user_metadata || {};

        const displayName =
          profile?.full_name ||
          getMetadataName(user);

        const phone =
          profile?.phone ||
          metadata.phone ||
          metadata.formatted_phone ||
          "";

        const customerCode =
          profile?.customer_code ||
          "------";

        if (profileAvatarLetter) {
          profileAvatarLetter.textContent =
            displayName
              .charAt(0)
              .toUpperCase();
        }

        if (profileUserName) {
          profileUserName.textContent =
            displayName;
        }

        if (profileUserPhone) {
          profileUserPhone.textContent =
            formatProfilePhone(
              phone
            );
        }

        if (profileCustomerCode) {
          profileCustomerCode.textContent =
            customerCode;
        }

        if (profileSheetLoading) {
          profileSheetLoading.hidden =
            true;
        }

        if (profileUserContent) {
          profileUserContent.hidden =
            false;
        }
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );

        if (profileSheetLoading) {
          profileSheetLoading.hidden =
            true;
        }

        if (profileGuestContent) {
          profileGuestContent.hidden =
            false;
        }

        showProfileMessage(
          "Unable to load profile details.",
          true
        );
      }
    }

    /* =================================
       LOGOUT
    ================================= */

    async function logoutUser() {
      if (
        typeof supabaseClient ===
        "undefined"
      ) {
        showProfileMessage(
          "Supabase is not connected.",
          true
        );

        return;
      }

      const shouldLogout =
        window.confirm(
          "Do you want to logout?"
        );

      if (!shouldLogout) {
        return;
      }

      if (profileLogoutButton) {
        profileLogoutButton.disabled =
          true;

        profileLogoutButton.textContent =
          "Logging out...";
      }

      showProfileMessage("");

      try {
        const {
          error
        } =
          await supabaseClient.auth
            .signOut();

        if (error) {
          throw error;
        }

        localStorage.removeItem(
          "ajjaramCheckout"
        );

        closeProfileSheet();

        window.location.href =
          "index.html";
      } catch (error) {
        console.error(
          "Logout failed:",
          error
        );

        showProfileMessage(
          error.message ||
          "Unable to logout.",
          true
        );

        if (profileLogoutButton) {
          profileLogoutButton.disabled =
            false;

          profileLogoutButton.textContent =
            "Logout";
        }
      }
    }

    /* =================================
       PROFILE EVENTS
    ================================= */

    profileButton?.addEventListener(
      "click",
      openProfileSheet
    );

    profileSheetClose?.addEventListener(
      "click",
      closeProfileSheet
    );

    profileSheetOverlay
      ?.addEventListener(
        "click",
        closeProfileSheet
      );

    profileLogoutButton
      ?.addEventListener(
        "click",
        logoutUser
      );

    profileLoginButton
      ?.addEventListener(
        "click",
        function () {
          /*
           * Opens the cart where customer
           * login is shown during Buy Now.
           */

          window.location.href =
            "cart.html";
        }
      );

    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          profileBottomSheet
            ?.classList.contains(
              "is-open"
            )
        ) {
          closeProfileSheet();
        }
      }
    );
  }
);