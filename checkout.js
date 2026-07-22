document.addEventListener(
  "DOMContentLoaded",
  function () {
    /* =================================
       ELEMENTS
    ================================= */

    const checkoutLoading =
      document.getElementById(
        "checkoutLoading"
      );

    const checkoutLayout =
      document.getElementById(
        "checkoutLayout"
      );

    const checkoutEmpty =
      document.getElementById(
        "checkoutEmpty"
      );

    const checkoutSuccess =
      document.getElementById(
        "checkoutSuccess"
      );

    const checkoutProducts =
      document.getElementById(
        "checkoutProducts"
      );

    const checkoutOriginalPrice =
      document.getElementById(
        "checkoutOriginalPrice"
      );

    const checkoutDiscount =
      document.getElementById(
        "checkoutDiscount"
      );

    const checkoutTotal =
      document.getElementById(
        "checkoutTotal"
      );

    const checkoutSavings =
      document.getElementById(
        "checkoutSavings"
      );

    const checkoutForm =
      document.getElementById(
        "checkoutForm"
      );

    const checkoutMessage =
      document.getElementById(
        "checkoutMessage"
      );

    const placeOrderButton =
      document.getElementById(
        "placeOrderButton"
      );

    const upiMessage =
      document.getElementById(
        "upiMessage"
      );

    const checkoutSuccessMessage =
      document.getElementById(
        "checkoutSuccessMessage"
      );

    /* Address elements */

    const addressFormSection =
      document.getElementById(
        "addressFormSection"
      );

    const savedAddressCard =
      document.getElementById(
        "savedAddressCard"
      );

    const saveAddressButton =
      document.getElementById(
        "saveAddressButton"
      );

    const editAddressButton =
      document.getElementById(
        "editAddressButton"
      );

    const changeAddressButton =
      document.getElementById(
        "changeAddressButton"
      );

    const savedCustomerName =
      document.getElementById(
        "savedCustomerName"
      );

    const savedCustomerPhone =
      document.getElementById(
        "savedCustomerPhone"
      );

    const savedAddressText =
      document.getElementById(
        "savedAddressText"
      );

    /* Customer fields */

    const customerName =
      document.getElementById(
        "customerName"
      );

    const customerPhone =
      document.getElementById(
        "customerPhone"
      );

    const customerAddress =
      document.getElementById(
        "customerAddress"
      );

    const customerCity =
      document.getElementById(
        "customerCity"
      );

    const customerState =
      document.getElementById(
        "customerState"
      );

    const customerPincode =
      document.getElementById(
        "customerPincode"
      );

    const customerLandmark =
      document.getElementById(
        "customerLandmark"
      );

    const customerStorageKey =
      "ajjaramCustomerDetails";

    let checkoutCart = [];
    let selectedAddress = null;

    /* =================================
       HELPERS
    ================================= */

    function showMessage(
      message,
      isError = false
    ) {
      if (!checkoutMessage) {
        return;
      }

      checkoutMessage.textContent =
        message || "";

      checkoutMessage.classList.toggle(
        "error",
        Boolean(isError)
      );
    }

    function readCheckoutCart() {
      try {
        const checkoutData =
          JSON.parse(
            localStorage.getItem(
              "ajjaramCheckout"
            ) || "[]"
          );

        if (
          Array.isArray(checkoutData) &&
          checkoutData.length > 0
        ) {
          return checkoutData;
        }

        const cartData =
          JSON.parse(
            localStorage.getItem(
              "ajjaramCart"
            ) || "[]"
          );

        return Array.isArray(cartData)
          ? cartData
          : [];
      } catch (error) {
        console.error(
          "Unable to read checkout data:",
          error
        );

        return [];
      }
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
        Number(value || 0)
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

    function getQuantity(product) {
      const quantity =
        Number(product.quantity || 1);

      return (
        Number.isInteger(quantity) &&
        quantity > 0
      )
        ? quantity
        : 1;
    }

    function getSellingPrice(product) {
      return Number(
        product.price ||
        product.selling_price ||
        0
      );
    }

    function getOriginalPrice(product) {
      const sellingPrice =
        getSellingPrice(product);

      const originalPrice =
        Number(
          product.old_price ||
          product.oldPrice ||
          product.original_price ||
          sellingPrice
        );

      return originalPrice > 0
        ? originalPrice
        : sellingPrice;
    }

    function getImage(product) {
      return (
        product.image_url ||
        product.imageUrl ||
        product.image ||
        "images/image-placeholder.png"
      );
    }

    /* =================================
       ADDRESS HELPERS
    ================================= */

    function getAddressFromForm() {
      return {
        name:
          customerName?.value.trim() ||
          "",

        phone:
          customerPhone?.value.trim() ||
          "",

        address:
          customerAddress?.value.trim() ||
          "",

        city:
          customerCity?.value.trim() ||
          "",

        state:
          customerState?.value.trim() ||
          "",

        pincode:
          customerPincode?.value.trim() ||
          "",

        landmark:
          customerLandmark?.value.trim() ||
          ""
      };
    }

    function fillAddressForm(address) {
      if (!address) {
        return;
      }

      if (customerName) {
        customerName.value =
          address.name || "";
      }

      if (customerPhone) {
        customerPhone.value =
          address.phone || "";
      }

      if (customerAddress) {
        customerAddress.value =
          address.address || "";
      }

      if (customerCity) {
        customerCity.value =
          address.city || "";
      }

      if (customerState) {
        customerState.value =
          address.state || "";
      }

      if (customerPincode) {
        customerPincode.value =
          address.pincode || "";
      }

      if (customerLandmark) {
        customerLandmark.value =
          address.landmark || "";
      }
    }

    function validateAddress(address) {
      if (!address.name) {
        showMessage(
          "Enter your full name.",
          true
        );

        customerName?.focus();

        return false;
      }

      if (
        !/^[6-9]\d{9}$/.test(
          address.phone
        )
      ) {
        showMessage(
          "Enter a valid 10-digit mobile number.",
          true
        );

        customerPhone?.focus();

        return false;
      }

      if (!address.address) {
        showMessage(
          "Enter your complete address.",
          true
        );

        customerAddress?.focus();

        return false;
      }

      if (!address.city) {
        showMessage(
          "Enter your city.",
          true
        );

        customerCity?.focus();

        return false;
      }

      if (!address.state) {
        showMessage(
          "Enter your state.",
          true
        );

        customerState?.focus();

        return false;
      }

      if (
        !/^\d{6}$/.test(
          address.pincode
        )
      ) {
        showMessage(
          "Enter a valid 6-digit PIN code.",
          true
        );

        customerPincode?.focus();

        return false;
      }

      return true;
    }

    function renderSavedAddress(address) {
      if (
        !address ||
        !address.name ||
        !address.phone
      ) {
        selectedAddress = null;

        if (savedAddressCard) {
          savedAddressCard.hidden = true;
        }

        if (addressFormSection) {
          addressFormSection.classList
            .remove("is-hidden");
        }

        if (changeAddressButton) {
          changeAddressButton.hidden =
            true;
        }

        return;
      }

      selectedAddress = address;

      if (savedCustomerName) {
        savedCustomerName.textContent =
          address.name;
      }

      if (savedCustomerPhone) {
        savedCustomerPhone.textContent =
          address.phone;
      }

      const addressParts = [
        address.address,
        address.landmark,
        address.city,
        address.state,
        address.pincode
      ].filter(Boolean);

      if (savedAddressText) {
        savedAddressText.textContent =
          addressParts.join(", ");
      }

      if (savedAddressCard) {
        savedAddressCard.hidden = false;
      }

      if (addressFormSection) {
        addressFormSection.classList.add(
          "is-hidden"
        );
      }

      if (changeAddressButton) {
        changeAddressButton.hidden =
          false;
      }
    }

    function saveAddress() {
      const address =
        getAddressFromForm();

      if (!validateAddress(address)) {
        return;
      }

      try {
        localStorage.setItem(
          customerStorageKey,
          JSON.stringify(address)
        );

        renderSavedAddress(address);

        showMessage(
          "Address saved successfully."
        );
      } catch (error) {
        console.error(
          "Unable to save address:",
          error
        );

        showMessage(
          "Unable to save address.",
          true
        );
      }
    }

    function loadSavedAddress() {
      try {
        const savedAddress =
          JSON.parse(
            localStorage.getItem(
              customerStorageKey
            ) || "null"
          );

        if (
          savedAddress &&
          typeof savedAddress ===
            "object"
        ) {
          fillAddressForm(
            savedAddress
          );

          renderSavedAddress(
            savedAddress
          );
        } else {
          renderSavedAddress(null);
        }
      } catch (error) {
        console.error(
          "Unable to load saved address:",
          error
        );

        renderSavedAddress(null);
      }
    }

    function openAddressForm() {
      if (selectedAddress) {
        fillAddressForm(
          selectedAddress
        );
      }

      if (savedAddressCard) {
        savedAddressCard.hidden = true;
      }

      if (addressFormSection) {
        addressFormSection.classList
          .remove("is-hidden");
      }

      if (changeAddressButton) {
        changeAddressButton.hidden =
          true;
      }

      showMessage("");

      customerName?.focus();
    }

    /* =================================
       ADDRESS EVENTS
    ================================= */

    if (saveAddressButton) {
      saveAddressButton.addEventListener(
        "click",
        saveAddress
      );
    }

    if (editAddressButton) {
      editAddressButton.addEventListener(
        "click",
        openAddressForm
      );
    }

    if (changeAddressButton) {
      changeAddressButton.addEventListener(
        "click",
        openAddressForm
      );
    }

    /* =================================
       RENDER PRODUCTS
    ================================= */

    function renderCheckout() {
      if (checkoutLoading) {
        checkoutLoading.hidden = true;
      }

      if (
        !Array.isArray(checkoutCart) ||
        checkoutCart.length === 0
      ) {
        if (checkoutLayout) {
          checkoutLayout.hidden = true;
        }

        if (checkoutSuccess) {
          checkoutSuccess.hidden = true;
        }

        if (checkoutEmpty) {
          checkoutEmpty.hidden = false;
        }

        return;
      }

      if (checkoutEmpty) {
        checkoutEmpty.hidden = true;
      }

      if (checkoutSuccess) {
        checkoutSuccess.hidden = true;
      }

      if (checkoutLayout) {
        checkoutLayout.hidden = false;
      }

      if (!checkoutProducts) {
        return;
      }

      checkoutProducts.innerHTML = "";

      let originalTotal = 0;
      let sellingTotal = 0;

      checkoutCart.forEach(
        function (product) {
          const quantity =
            getQuantity(product);

          const sellingPrice =
            getSellingPrice(product);

          const originalPrice =
            getOriginalPrice(product);

          originalTotal +=
            originalPrice *
            quantity;

          sellingTotal +=
            sellingPrice *
            quantity;

          const productElement =
            document.createElement(
              "article"
            );

          productElement.className =
            "checkout-product";

          productElement.innerHTML = `
            <div class="checkout-product-image">
              <img
                src="${escapeHTML(
                  getImage(product)
                )}"
                alt="${escapeHTML(
                  product.name ||
                  "Brass product"
                )}"
              >
            </div>

            <div class="checkout-product-info">
              <h3>
                ${escapeHTML(
                  product.name ||
                  "Brass Product"
                )}
              </h3>

              <p>
                Quantity: ${quantity}
              </p>

              <strong>
                ${formatPrice(
                  sellingPrice *
                  quantity
                )}
              </strong>
            </div>
          `;

          const image =
            productElement.querySelector(
              "img"
            );

          if (image) {
            image.addEventListener(
              "error",
              function () {
                image.src =
                  "images/image-placeholder.png";
              },
              {
                once: true
              }
            );
          }

          checkoutProducts.appendChild(
            productElement
          );
        }
      );

      const discount =
        Math.max(
          0,
          originalTotal -
          sellingTotal
        );

      if (checkoutOriginalPrice) {
        checkoutOriginalPrice.textContent =
          formatPrice(originalTotal);
      }

      if (checkoutDiscount) {
        checkoutDiscount.textContent =
          `− ${formatPrice(
            discount
          )}`;
      }

      if (checkoutTotal) {
        checkoutTotal.textContent =
          formatPrice(sellingTotal);
      }

      if (checkoutSavings) {
        checkoutSavings.textContent =
          discount > 0
            ? `You saved ${formatPrice(
                discount
              )} on this order`
            : "";
      }
    }

    /* =================================
       PAYMENT
    ================================= */

    const paymentInputs =
      document.querySelectorAll(
        'input[name="paymentMethod"]'
      );

    paymentInputs.forEach(
      function (input) {
        input.addEventListener(
          "change",
          function () {
            const paymentMethod =
              document.querySelector(
                'input[name="paymentMethod"]:checked'
              )?.value;

            if (upiMessage) {
              upiMessage.hidden =
                paymentMethod !== "UPI";
            }

            showMessage("");
          }
        );
      }
    );

    /* =================================
       PLACE ORDER
    ================================= */

    if (checkoutForm) {
      checkoutForm.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          showMessage("");

          if (
            !Array.isArray(checkoutCart) ||
            checkoutCart.length === 0
          ) {
            showMessage(
              "Your checkout cart is empty.",
              true
            );

            return;
          }

          let addressForOrder =
            selectedAddress;

          if (!addressForOrder) {
            addressForOrder =
              getAddressFromForm();

            if (
              !validateAddress(
                addressForOrder
              )
            ) {
              return;
            }

            try {
              localStorage.setItem(
                customerStorageKey,
                JSON.stringify(
                  addressForOrder
                )
              );
            } catch (error) {
              console.error(
                "Unable to save address:",
                error
              );
            }
          }

          const paymentMethod =
            document.querySelector(
              'input[name="paymentMethod"]:checked'
            )?.value;

          if (
            paymentMethod === "UPI"
          ) {
            showMessage(
              "UPI payment is not connected yet. Select Cash on Delivery.",
              true
            );

            return;
          }

          if (placeOrderButton) {
            placeOrderButton.disabled =
              true;

            placeOrderButton.textContent =
              "Placing Order...";
          }

          try {
            const orderId =
              `AJJ${Date.now()}`;

            const orderData = {
              order_id: orderId,

              customer: {
                name:
                  addressForOrder.name,

                phone:
                  addressForOrder.phone,

                address:
                  addressForOrder.address,

                city:
                  addressForOrder.city,

                state:
                  addressForOrder.state,

                pincode:
                  addressForOrder.pincode,

                landmark:
                  addressForOrder.landmark
              },

              products:
                checkoutCart,

              payment_method:
                paymentMethod,

              status:
                "Order Placed",

              created_at:
                new Date()
                  .toISOString()
            };

            let orders = [];

            try {
              const savedOrders =
                JSON.parse(
                  localStorage.getItem(
                    "ajjaramOrders"
                  ) || "[]"
                );

              orders =
                Array.isArray(
                  savedOrders
                )
                  ? savedOrders
                  : [];
            } catch (error) {
              orders = [];
            }

            orders.push(orderData);

            localStorage.setItem(
              "ajjaramOrders",
              JSON.stringify(orders)
            );

            localStorage.removeItem(
              "ajjaramCart"
            );

            localStorage.removeItem(
              "ajjaramCheckout"
            );

            checkoutCart = [];

            if (checkoutLayout) {
              checkoutLayout.hidden =
                true;
            }

            if (checkoutEmpty) {
              checkoutEmpty.hidden =
                true;
            }

            if (checkoutSuccess) {
              checkoutSuccess.hidden =
                false;
            }

            if (
              checkoutSuccessMessage
            ) {
              checkoutSuccessMessage
                .textContent =
                `Thank you, ${addressForOrder.name}. Your order ID is ${orderId}.`;
            }

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          } catch (error) {
            console.error(
              "Unable to place order:",
              error
            );

            showMessage(
              "Unable to place your order. Please try again.",
              true
            );

            if (placeOrderButton) {
              placeOrderButton.disabled =
                false;

              placeOrderButton.textContent =
                "Place Order";
            }
          }
        }
      );
    }

    /* =================================
       START
    ================================= */

    checkoutCart =
      readCheckoutCart();

    loadSavedAddress();

    renderCheckout();
  }
);