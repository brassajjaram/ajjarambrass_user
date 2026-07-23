document.addEventListener(
  "DOMContentLoaded",
  function () {
    /* =================================
       CART ELEMENTS
    ================================= */

    const cartOriginalPrice =
      document.getElementById(
        "cartOriginalPrice"
      );

    const cartDiscountAmount =
      document.getElementById(
        "cartDiscountAmount"
      );

    const cartSavingsText =
      document.getElementById(
        "cartSavingsText"
      );

    const cartCard =
      document.getElementById(
        "cartCard"
      );

    const cartProducts =
      document.getElementById(
        "cartProducts"
      );

    const emptyCart =
      document.getElementById(
        "emptyCart"
      );

    const cartTotal =
      document.getElementById(
        "cartTotal"
      );

    const cartHeaderCount =
      document.getElementById(
        "cartHeaderCount"
      );

    const payButton =
      document.getElementById(
        "payButton"
      );

    /* =================================
       LOGIN / SIGNUP ELEMENTS
    ================================= */

    const cartLoginOverlay =
      document.getElementById(
        "cartLoginOverlay"
      );

    const cartLoginSheet =
      document.getElementById(
        "cartLoginSheet"
      );

    const cartLoginClose =
      document.getElementById(
        "cartLoginClose"
      );

    const cartAuthTitle =
      document.getElementById(
        "cartAuthTitle"
      );

    const cartLoginSection =
      document.getElementById(
        "cartLoginSection"
      );

    const cartSignupSection =
      document.getElementById(
        "cartSignupSection"
      );

    const cartLoginForm =
      document.getElementById(
        "cartLoginForm"
      );

    const cartSignupForm =
      document.getElementById(
        "cartSignupForm"
      );

    const cartLoginPhone =
      document.getElementById(
        "cartLoginPhone"
      );

    const cartLoginPassword =
      document.getElementById(
        "cartLoginPassword"
      );

    const cartSignupName =
      document.getElementById(
        "cartSignupName"
      );

    const cartSignupPhone =
      document.getElementById(
        "cartSignupPhone"
      );

    const cartSignupPassword =
      document.getElementById(
        "cartSignupPassword"
      );

    const cartSignupConfirmPassword =
      document.getElementById(
        "cartSignupConfirmPassword"
      );

    const cartLoginSubmit =
      document.getElementById(
        "cartLoginSubmit"
      );

    const cartSignupSubmit =
      document.getElementById(
        "cartSignupSubmit"
      );

    const cartLoginMessage =
      document.getElementById(
        "cartLoginMessage"
      );

    const cartSignupMessage =
      document.getElementById(
        "cartSignupMessage"
      );

    const showCartSignupButton =
      document.getElementById(
        "showCartSignupButton"
      );

    const showCartLoginButton =
      document.getElementById(
        "showCartLoginButton"
      );

    let pendingCheckoutCart = [];

    /* =================================
       CART STORAGE
    ================================= */

    function getCart() {
      try {
        const savedCart =
          localStorage.getItem(
            "ajjaramCart"
          );

        if (!savedCart) {
          return [];
        }

        const parsedCart =
          JSON.parse(savedCart);

        return Array.isArray(parsedCart)
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
       GENERAL HELPERS
    ================================= */

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

    function escapeHTML(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function setMessage(
      element,
      message,
      isError = false
    ) {
      if (!element) {
        return;
      }

      element.textContent =
        message || "";

      element.classList.toggle(
        "error",
        Boolean(isError)
      );
    }

    function setButtonLoading(
      button,
      loading,
      normalText,
      loadingText
    ) {
      if (!button) {
        return;
      }

      button.disabled =
        loading;

      button.textContent =
        loading
          ? loadingText
          : normalText;
    }

    function getReadableAuthError(
      error,
      mode = "signup"
    ) {
      const originalMessage =
        String(
          error?.message ||
          error ||
          ""
        ).trim();

      const lowerMessage =
        originalMessage.toLowerCase();

      if (
        lowerMessage.includes(
          "already registered"
        ) ||
        lowerMessage.includes(
          "user already registered"
        ) ||
        lowerMessage.includes(
          "email already"
        ) ||
        lowerMessage.includes(
          "already exists"
        )
      ) {
        return mode === "login"
          ? "Incorrect phone number or password."
          : "This phone number already has an account. Please login.";
      }

      if (
        lowerMessage.includes(
          "invalid login credentials"
        )
      ) {
        return "Incorrect phone number or password.";
      }

      if (
        lowerMessage.includes(
          "database error"
        ) ||
        lowerMessage.includes(
          "saving new user"
        ) ||
        lowerMessage.includes(
          "failed to create user"
        )
      ) {
        return "Unable to create your customer profile. Please try again.";
      }

      if (
        lowerMessage.includes(
          "email not confirmed"
        )
      ) {
        return "Email confirmation is enabled in Supabase. Turn off Confirm Email.";
      }

      if (
        lowerMessage.includes(
          "provider is disabled"
        ) ||
        lowerMessage.includes(
          "email authentication is disabled"
        )
      ) {
        return "Email authentication is disabled in Supabase.";
      }

      if (
        lowerMessage.includes(
          "rate limit"
        ) ||
        lowerMessage.includes(
          "too many requests"
        )
      ) {
        return "Too many attempts. Please wait and try again.";
      }

      return (
        originalMessage ||
        (
          mode === "login"
            ? "Unable to login."
            : "Unable to create account."
        )
      );
    }

    /* =================================
       PHONE HELPERS
    ================================= */

    function normalizeIndianPhone(
      value
    ) {
      const digits =
        String(value || "")
          .replace(/\D/g, "");

      let phone =
        digits;

      if (
        digits.startsWith("91") &&
        digits.length === 12
      ) {
        phone =
          digits.slice(2);
      }

      if (
        !/^[6-9]\d{9}$/.test(
          phone
        )
      ) {
        return null;
      }

      return phone;
    }

    function phoneToInternalEmail(
      phone
    ) {
      return (
        `ajjarambrass+customer${phone}` +
        `@gmail.com`
      );
    }

    /* =================================
       CART TOTALS
    ================================= */

    function getTotalQuantity(cart) {
      return cart.reduce(
        function (total, item) {
          return (
            total +
            Number(
              item.quantity || 0
            )
          );
        },
        0
      );
    }

    function getOriginalPriceTotal(
      cart
    ) {
      return cart.reduce(
        function (total, item) {
          const price =
            Number(
              item.price || 0
            );

          let oldPrice =
            Number(
              item.oldPrice ||
              item.old_price ||
              price
            );

          const quantity =
            Number(
              item.quantity || 0
            );

          if (
            oldPrice <= 0 ||
            oldPrice < price
          ) {
            oldPrice =
              price;
          }

          return (
            total +
            oldPrice *
            quantity
          );
        },
        0
      );
    }

    function getFinalPriceTotal(
      cart
    ) {
      return cart.reduce(
        function (total, item) {
          const price =
            Number(
              item.price || 0
            );

          const quantity =
            Number(
              item.quantity || 0
            );

          return (
            total +
            price *
            quantity
          );
        },
        0
      );
    }

    function updatePriceDetails(
      cart
    ) {
      const originalTotal =
        getOriginalPriceTotal(
          cart
        );

      const finalTotal =
        getFinalPriceTotal(
          cart
        );

      const discount =
        Math.max(
          originalTotal -
          finalTotal,
          0
        );

      if (cartOriginalPrice) {
        cartOriginalPrice.textContent =
          formatPrice(
            originalTotal
          );
      }

      if (cartDiscountAmount) {
        cartDiscountAmount.textContent =
          `− ${formatPrice(
            discount
          )}`;
      }

      if (cartTotal) {
        cartTotal.textContent =
          formatPrice(
            finalTotal
          );
      }

      if (cartSavingsText) {
        cartSavingsText.textContent =
          `You saved ${formatPrice(
            discount
          )} on this order`;
      }
    }

    /* =================================
       RENDER CART
    ================================= */

    function renderCart() {
      const cart =
        getCart();

      const validCart =
        cart.filter(
          function (item) {
            return (
              Number(
                item.quantity || 0
              ) > 0
            );
          }
        );

      if (
        validCart.length !==
        cart.length
      ) {
        saveCart(
          validCart
        );
      }

      const totalQuantity =
        getTotalQuantity(
          validCart
        );

      if (cartHeaderCount) {
        cartHeaderCount.textContent =
          `${totalQuantity} ${
            totalQuantity === 1
              ? "item"
              : "items"
          }`;
      }

      if (!cartProducts) {
        return;
      }

      cartProducts.innerHTML =
        "";

      if (
        validCart.length === 0
      ) {
        if (cartCard) {
          cartCard.hidden =
            true;
        }

        if (emptyCart) {
          emptyCart.hidden =
            false;
        }

        updatePriceDetails(
          []
        );

        return;
      }

      if (cartCard) {
        cartCard.hidden =
          false;
      }

      if (emptyCart) {
        emptyCart.hidden =
          true;
      }

      updatePriceDetails(
        validCart
      );

      validCart.forEach(
        function (item) {
          const quantity =
            Number(
              item.quantity || 1
            );

          const price =
            Number(
              item.price || 0
            );

          let oldPrice =
            Number(
              item.oldPrice ||
              item.old_price ||
              price
            );

          if (
            oldPrice <= 0 ||
            oldPrice < price
          ) {
            oldPrice =
              price;
          }

          const image =
            item.image ||
            item.image_url ||
            item.imageUrl ||
            "images/image-placeholder.png";

          const productRow =
            document.createElement(
              "article"
            );

          productRow.className =
            "cart-product-row";

          productRow.dataset.productId =
            String(item.id);

          const oldPriceHTML =
            oldPrice > price
              ? `
                <span class="cart-product-old-price">
                  ${formatPrice(
                    oldPrice
                  )}
                </span>
              `
              : "";

          const discountHTML =
            Number(
              item.discount
            ) > 0
              ? `
                <span class="cart-product-discount">
                  ${Number(
                    item.discount
                  )}% OFF
                </span>
              `
              : "";

          productRow.innerHTML = `
            <div class="cart-product-image">

              <img
                src="${escapeHTML(
                  image
                )}"
                alt="${escapeHTML(
                  item.name ||
                  "Brass product"
                )}"
              >

            </div>

            <div class="cart-product-info">

              <h2 class="cart-product-name">
                ${escapeHTML(
                  item.name ||
                  "Brass Product"
                )}
              </h2>

              <div class="cart-product-price-row">

                <span class="cart-product-price">
                  ${formatPrice(
                    price
                  )}
                </span>

                ${oldPriceHTML}
                ${discountHTML}

              </div>

              <div class="cart-product-actions">

                <div class="cart-quantity-control">

                  <button
                    class="cart-quantity-button decrease-cart-quantity"
                    type="button"
                    data-product-id="${escapeHTML(
                      item.id
                    )}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span class="cart-quantity-value">
                    ${quantity}
                  </span>

                  <button
                    class="cart-quantity-button increase-cart-quantity"
                    type="button"
                    data-product-id="${escapeHTML(
                      item.id
                    )}"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

                <strong class="cart-item-total">
                  ${formatPrice(
                    price *
                    quantity
                  )}
                </strong>

              </div>

            </div>
          `;

          const productImage =
            productRow.querySelector(
              "img"
            );

          productImage
            ?.addEventListener(
              "error",
              function () {
                productImage.src =
                  "images/image-placeholder.png";
              },
              {
                once: true
              }
            );

          cartProducts.appendChild(
            productRow
          );
        }
      );
    }

    /* =================================
       QUANTITY CONTROLS
    ================================= */

    cartProducts
      ?.addEventListener(
        "click",
        function (event) {
          const increaseButton =
            event.target.closest(
              ".increase-cart-quantity"
            );

          const decreaseButton =
            event.target.closest(
              ".decrease-cart-quantity"
            );

          if (
            !increaseButton &&
            !decreaseButton
          ) {
            return;
          }

          const clickedButton =
            increaseButton ||
            decreaseButton;

          const productId =
            String(
              clickedButton.dataset
                .productId
            );

          const cart =
            getCart();

          const itemIndex =
            cart.findIndex(
              function (item) {
                return (
                  String(
                    item.id
                  ) ===
                  productId
                );
              }
            );

          if (
            itemIndex === -1
          ) {
            return;
          }

          if (increaseButton) {
            cart[itemIndex].quantity =
              Number(
                cart[itemIndex]
                  .quantity || 0
              ) + 1;
          }

          if (decreaseButton) {
            cart[itemIndex].quantity =
              Number(
                cart[itemIndex]
                  .quantity || 0
              ) - 1;

            if (
              cart[itemIndex]
                .quantity <= 0
            ) {
              cart.splice(
                itemIndex,
                1
              );
            }
          }

          saveCart(cart);

          renderCart();
        }
      );

    /* =================================
       AUTH SHEET
    ================================= */

    function showLoginSection() {
      if (cartAuthTitle) {
        cartAuthTitle.textContent =
          "Login to Continue";
      }

      if (cartLoginSection) {
        cartLoginSection.hidden =
          false;
      }

      if (cartSignupSection) {
        cartSignupSection.hidden =
          true;
      }

      setMessage(
        cartLoginMessage,
        ""
      );

      setMessage(
        cartSignupMessage,
        ""
      );

      window.setTimeout(
        function () {
          cartLoginPhone
            ?.focus();
        },
        100
      );
    }

    function showSignupSection() {
      if (cartAuthTitle) {
        cartAuthTitle.textContent =
          "Create Account";
      }

      if (cartLoginSection) {
        cartLoginSection.hidden =
          true;
      }

      if (cartSignupSection) {
        cartSignupSection.hidden =
          false;
      }

      setMessage(
        cartLoginMessage,
        ""
      );

      setMessage(
        cartSignupMessage,
        ""
      );

      window.setTimeout(
        function () {
          cartSignupName
            ?.focus();
        },
        100
      );
    }

    function openAuthSheet() {
      if (
        !cartLoginOverlay ||
        !cartLoginSheet
      ) {
        return;
      }

      showLoginSection();

      cartLoginOverlay.hidden =
        false;

      requestAnimationFrame(
        function () {
          cartLoginOverlay
            .classList.add(
              "is-visible"
            );

          cartLoginSheet
            .classList.add(
              "is-open"
            );
        }
      );

      cartLoginSheet.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "cart-login-open"
      );
    }

    function closeAuthSheet() {
      if (
        !cartLoginOverlay ||
        !cartLoginSheet
      ) {
        return;
      }

      cartLoginOverlay
        .classList.remove(
          "is-visible"
        );

      cartLoginSheet
        .classList.remove(
          "is-open"
        );

      cartLoginSheet.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "cart-login-open"
      );

      window.setTimeout(
        function () {
          cartLoginOverlay.hidden =
            true;
        },
        300
      );
    }

    /* =================================
       CHECKOUT
    ================================= */

    function continueToCheckout(
      cart
    ) {
      const validCart =
        Array.isArray(cart)
          ? cart.filter(
              function (item) {
                return (
                  Number(
                    item.quantity || 0
                  ) > 0
                );
              }
            )
          : [];

      if (
        validCart.length === 0
      ) {
        window.alert(
          "Your cart is empty."
        );

        return;
      }

      localStorage.setItem(
        "ajjaramCheckout",
        JSON.stringify(
          validCart
        )
      );

      window.location.href =
        "checkout.html";
    }

    /* =================================
       BUY NOW
    ================================= */

    payButton
      ?.addEventListener(
        "click",
        async function () {
          const validCart =
            getCart().filter(
              function (item) {
                return (
                  Number(
                    item.quantity || 0
                  ) > 0
                );
              }
            );

          if (
            validCart.length === 0
          ) {
            window.alert(
              "Your cart is empty."
            );

            return;
          }

          pendingCheckoutCart =
            validCart;

          if (
            typeof supabaseClient ===
            "undefined"
          ) {
            window.alert(
              "Supabase is not connected. Check supabase-config.js."
            );

            return;
          }

          setButtonLoading(
            payButton,
            true,
            "Buy Now",
            "Checking..."
          );

          try {
            const {
              data,
              error
            } =
              await supabaseClient.auth
                .getSession();

            if (error) {
              throw error;
            }

            const user =
              data?.session?.user;

            if (user) {
              const accountType =
                user.user_metadata
                  ?.account_type;

              if (
                accountType ===
                "admin"
              ) {
                setButtonLoading(
                  payButton,
                  false,
                  "Buy Now",
                  "Checking..."
                );

                window.alert(
                  "You are logged in as admin. Logout from admin before placing an order."
                );

                return;
              }

              continueToCheckout(
                validCart
              );

              return;
            }

            setButtonLoading(
              payButton,
              false,
              "Buy Now",
              "Checking..."
            );

            openAuthSheet();
          } catch (error) {
            console.error(
              "Session check failed:",
              error
            );

            setButtonLoading(
              payButton,
              false,
              "Buy Now",
              "Checking..."
            );

            openAuthSheet();
          }
        }
      );

    /* =================================
       CUSTOMER LOGIN
    ================================= */

    cartLoginForm
      ?.addEventListener(
        "submit",
        async function (event) {
          event.preventDefault();

          setMessage(
            cartLoginMessage,
            ""
          );

          if (
            typeof supabaseClient ===
            "undefined"
          ) {
            setMessage(
              cartLoginMessage,
              "Supabase is not connected.",
              true
            );

            return;
          }

          const phone =
            normalizeIndianPhone(
              cartLoginPhone
                ?.value
            );

          const password =
            cartLoginPassword
              ?.value || "";

          if (!phone) {
            setMessage(
              cartLoginMessage,
              "Enter a valid 10-digit Indian phone number.",
              true
            );

            cartLoginPhone
              ?.focus();

            return;
          }

          if (
            password.length < 6
          ) {
            setMessage(
              cartLoginMessage,
              "Password must contain at least 6 characters.",
              true
            );

            cartLoginPassword
              ?.focus();

            return;
          }

          const internalEmail =
            phoneToInternalEmail(
              phone
            );

          setButtonLoading(
            cartLoginSubmit,
            true,
            "Login and Continue",
            "Logging in..."
          );

          try {
            const {
              data,
              error
            } =
              await supabaseClient.auth
                .signInWithPassword({
                  email:
                    internalEmail,

                  password:
                    password
                });

            if (error) {
              throw error;
            }

            if (
              !data?.user ||
              !data?.session
            ) {
              throw new Error(
                "Unable to create login session."
              );
            }

            const accountType =
              data.user.user_metadata
                ?.account_type;

            if (
              accountType ===
              "admin"
            ) {
              await supabaseClient.auth
                .signOut();

              throw new Error(
                "Admin accounts cannot use customer login."
              );
            }

            setMessage(
              cartLoginMessage,
              "Login successful."
            );

            const checkoutCart =
              pendingCheckoutCart.length > 0
                ? pendingCheckoutCart
                : getCart();

            window.setTimeout(
              function () {
                continueToCheckout(
                  checkoutCart
                );
              },
              400
            );
          } catch (error) {
            console.error(
              "Customer login failed:",
              error
            );

            const message =
              getReadableAuthError(
                error,
                "login"
              );

            setMessage(
              cartLoginMessage,
              message,
              true
            );

            setButtonLoading(
              cartLoginSubmit,
              false,
              "Login and Continue",
              "Logging in..."
            );
          }
        }
      );

    /* =================================
       CUSTOMER SIGNUP
    ================================= */

    cartSignupForm
      ?.addEventListener(
        "submit",
        async function (event) {
          event.preventDefault();

          setMessage(
            cartSignupMessage,
            ""
          );

          if (
            typeof supabaseClient ===
            "undefined"
          ) {
            setMessage(
              cartSignupMessage,
              "Supabase is not connected.",
              true
            );

            return;
          }

          const fullName =
            cartSignupName
              ?.value
              .trim() || "";

          const phone =
            normalizeIndianPhone(
              cartSignupPhone
                ?.value
            );

          const password =
            cartSignupPassword
              ?.value || "";

          const confirmPassword =
            cartSignupConfirmPassword
              ?.value || "";

          if (
            fullName.length < 2
          ) {
            setMessage(
              cartSignupMessage,
              "Enter your full name.",
              true
            );

            cartSignupName
              ?.focus();

            return;
          }

          if (!phone) {
            setMessage(
              cartSignupMessage,
              "Enter a valid 10-digit Indian phone number.",
              true
            );

            cartSignupPhone
              ?.focus();

            return;
          }

          if (
            password.length < 6
          ) {
            setMessage(
              cartSignupMessage,
              "Password must contain at least 6 characters.",
              true
            );

            cartSignupPassword
              ?.focus();

            return;
          }

          if (
            password !==
            confirmPassword
          ) {
            setMessage(
              cartSignupMessage,
              "Passwords do not match.",
              true
            );

            cartSignupConfirmPassword
              ?.focus();

            return;
          }

          const internalEmail =
            phoneToInternalEmail(
              phone
            );

          setButtonLoading(
            cartSignupSubmit,
            true,
            "Create Account",
            "Creating Account..."
          );

          try {
            const {
              data,
              error
            } =
              await supabaseClient.auth
                .signUp({
                  email:
                    internalEmail,

                  password:
                    password,

                  options: {
                    data: {
                      full_name:
                        fullName,

                      name:
                        fullName,

                      phone:
                        phone,

                      formatted_phone:
                        `+91${phone}`,

                      account_type:
                        "customer",

                      login_type:
                        "phone_alias"
                    }
                  }
                });

            if (error) {
              throw error;
            }

            if (
              data?.user &&
              Array.isArray(
                data.user.identities
              ) &&
              data.user.identities
                .length === 0
            ) {
              throw new Error(
                "This phone number already has an account. Please login."
              );
            }

            if (
              data?.user &&
              data?.session
            ) {
              setMessage(
                cartSignupMessage,
                "Account created successfully."
              );

              const checkoutCart =
                pendingCheckoutCart.length > 0
                  ? pendingCheckoutCart
                  : getCart();

              window.setTimeout(
                function () {
                  continueToCheckout(
                    checkoutCart
                  );
                },
                500
              );

              return;
            }

            if (
              data?.user &&
              !data?.session
            ) {
              throw new Error(
                "Account created, but Confirm Email is enabled. Turn it off in Supabase."
              );
            }

            throw new Error(
              "Unable to create account. Please try again."
            );
          } catch (error) {
            console.error(
              "Customer signup failed:",
              error
            );

            const message =
              getReadableAuthError(
                error,
                "signup"
              );

            setMessage(
              cartSignupMessage,
              message,
              true
            );

            setButtonLoading(
              cartSignupSubmit,
              false,
              "Create Account",
              "Creating Account..."
            );
          }
        }
      );

    /* =================================
       SWITCH LOGIN / SIGNUP
    ================================= */

    showCartSignupButton
      ?.addEventListener(
        "click",
        showSignupSection
      );

    showCartLoginButton
      ?.addEventListener(
        "click",
        showLoginSection
      );

    cartLoginClose
      ?.addEventListener(
        "click",
        closeAuthSheet
      );

    cartLoginOverlay
      ?.addEventListener(
        "click",
        closeAuthSheet
      );

    /* =================================
       PASSWORD EYE TOGGLES
    ================================= */

    function setupPasswordToggle(
      buttonId,
      inputId
    ) {
      const button =
        document.getElementById(
          buttonId
        );

      const input =
        document.getElementById(
          inputId
        );

      if (
        !button ||
        !input
      ) {
        return;
      }

      const crossedEye =
        button.querySelector(
          ".eye-icon-hidden"
        );

      const normalEye =
        button.querySelector(
          ".eye-icon-visible"
        );

      function updateEyeIcon() {
        const passwordVisible =
          input.type === "text";

        if (crossedEye) {
          crossedEye.style.display =
            passwordVisible
              ? "none"
              : "block";
        }

        if (normalEye) {
          normalEye.style.display =
            passwordVisible
              ? "block"
              : "none";
        }

        button.classList.toggle(
          "password-is-visible",
          passwordVisible
        );

        button.setAttribute(
          "aria-label",
          passwordVisible
            ? "Hide password"
            : "Show password"
        );

        button.setAttribute(
          "aria-pressed",
          String(
            passwordVisible
          )
        );
      }

      button.addEventListener(
        "click",
        function (event) {
          event.preventDefault();

          event.stopPropagation();

          const startPosition =
            input.selectionStart;

          const endPosition =
            input.selectionEnd;

          input.type =
            input.type ===
            "password"
              ? "text"
              : "password";

          updateEyeIcon();

          input.focus({
            preventScroll: true
          });

          if (
            typeof startPosition ===
              "number" &&
            typeof endPosition ===
              "number"
          ) {
            try {
              input.setSelectionRange(
                startPosition,
                endPosition
              );
            } catch (error) {
              console.log(
                "Unable to restore cursor position:",
                error
              );
            }
          }
        }
      );

      updateEyeIcon();
    }

    setupPasswordToggle(
      "cartLoginPasswordToggle",
      "cartLoginPassword"
    );

    setupPasswordToggle(
      "cartSignupPasswordToggle",
      "cartSignupPassword"
    );

    setupPasswordToggle(
      "cartSignupConfirmPasswordToggle",
      "cartSignupConfirmPassword"
    );

    /* =================================
       CLOSE WITH ESCAPE
    ================================= */

    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key ===
            "Escape" &&
          cartLoginSheet
            ?.classList.contains(
              "is-open"
            )
        ) {
          closeAuthSheet();
        }
      }
    );

    /* =================================
       INITIAL RENDER
    ================================= */

    renderCart();
  }
);
