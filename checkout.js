document.addEventListener(
  "DOMContentLoaded",
  function () {
    /* =================================
       ELEMENTS
    ================================= */

    const checkoutPageHeading =
      document.getElementById(
        "checkoutPageHeading"
      );

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

    const placeOrderButton =
      document.getElementById(
        "placeOrderButton"
      );

    const checkoutMessage =
      document.getElementById(
        "checkoutMessage"
      );

    const upiMessage =
      document.getElementById(
        "upiMessage"
      );

    const checkoutSuccessMessage =
      document.getElementById(
        "checkoutSuccessMessage"
      );

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

    const savedAddressCard =
      document.getElementById(
        "savedAddressCard"
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

    const addressFormSection =
      document.getElementById(
        "addressFormSection"
      );

    const saveAddressButton =
      document.getElementById(
        "saveAddressButton"
      );

    const editAddressButton =
      document.getElementById(
        "editAddressButton"
      );

    /* =================================
       STATE
    ================================= */

    let checkoutCart = [];

    let addressIsSaved = false;

    const customerStorageKey =
      "ajjaramCustomerDetails";

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

    function setPlaceOrderLoading(
      isLoading
    ) {
      if (!placeOrderButton) {
        return;
      }

      placeOrderButton.disabled =
        isLoading;

      placeOrderButton.textContent =
        isLoading
          ? "Placing Order..."
          : "Place Order";
    }

    function getQuantity(product) {
      const quantity =
        Number(
          product.quantity ||
          product.qty ||
          1
        );

      return (
        Number.isInteger(quantity) &&
        quantity > 0
      )
        ? quantity
        : 1;
    }

    function getSellingPrice(product) {
      return (
        Number(
          product.price ||
          product.selling_price ||
          product.final_price ||
          0
        ) || 0
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
          product.mrp ||
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
        product.product_image ||
        "images/image-placeholder.png"
      );
    }

    function getProductName(product) {
      return (
        product.name ||
        product.product_name ||
        product.title ||
        "Brass Product"
      );
    }

    function getProductId(product) {
      return (
        product.id ||
        product.product_id ||
        null
      );
    }

    function readCheckoutCart() {
      try {
        const savedCheckout =
          JSON.parse(
            localStorage.getItem(
              "ajjaramCheckout"
            ) || "[]"
          );

        if (
          Array.isArray(savedCheckout) &&
          savedCheckout.length > 0
        ) {
          return savedCheckout;
        }

        const savedCart =
          JSON.parse(
            localStorage.getItem(
              "ajjaramCart"
            ) || "[]"
          );

        return Array.isArray(savedCart)
          ? savedCart
          : [];
      } catch (error) {
        console.error(
          "Unable to read checkout data:",
          error
        );

        return [];
      }
    }

    function getCheckoutTotals() {
      let originalAmount = 0;
      let totalAmount = 0;

      checkoutCart.forEach(
        function (product) {
          const quantity =
            getQuantity(product);

          originalAmount +=
            getOriginalPrice(product) *
            quantity;

          totalAmount +=
            getSellingPrice(product) *
            quantity;
        }
      );

      return {
        originalAmount,

        discountAmount:
          Math.max(
            0,
            originalAmount -
            totalAmount
          ),

        totalAmount
      };
    }

    function generateOrderNumber() {
      const timestamp =
        Date.now()
          .toString()
          .slice(-10);

      const randomPart =
        Math.floor(
          1000 +
          Math.random() * 9000
        );

      return (
        `AJJ${timestamp}${randomPart}`
      );
    }

    /* =================================
       HEADER VISIBILITY
    ================================= */

    function updatePageState() {
      const successIsVisible =
        checkoutSuccess &&
        !checkoutSuccess.hidden;

      const emptyIsVisible =
        checkoutEmpty &&
        !checkoutEmpty.hidden;

      if (checkoutPageHeading) {
        checkoutPageHeading.hidden =
          successIsVisible ||
          emptyIsVisible;
      }

      document.body.classList.toggle(
        "checkout-success-active",
        Boolean(successIsVisible)
      );

      document.body.classList.toggle(
        "checkout-empty-active",
        Boolean(emptyIsVisible)
      );
    }

    if (checkoutSuccess) {
      new MutationObserver(
        updatePageState
      ).observe(
        checkoutSuccess,
        {
          attributes: true,
          attributeFilter: [
            "hidden"
          ]
        }
      );
    }

    if (checkoutEmpty) {
      new MutationObserver(
        updatePageState
      ).observe(
        checkoutEmpty,
        {
          attributes: true,
          attributeFilter: [
            "hidden"
          ]
        }
      );
    }

    /* =================================
       CUSTOMER DETAILS
    ================================= */

    function getCustomerDetails() {
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

    function saveCustomerDetails() {
      const customerDetails =
        getCustomerDetails();

      try {
        localStorage.setItem(
          customerStorageKey,
          JSON.stringify(
            customerDetails
          )
        );
      } catch (error) {
        console.error(
          "Unable to save customer details:",
          error
        );
      }

      return customerDetails;
    }

    function loadCustomerDetails() {
      try {
        const savedDetails =
          JSON.parse(
            localStorage.getItem(
              customerStorageKey
            ) || "null"
          );

        if (
          !savedDetails ||
          typeof savedDetails !==
            "object"
        ) {
          return;
        }

        if (customerName) {
          customerName.value =
            savedDetails.name || "";
        }

        if (customerPhone) {
          customerPhone.value =
            savedDetails.phone || "";
        }

        if (customerAddress) {
          customerAddress.value =
            savedDetails.address || "";
        }

        if (customerCity) {
          customerCity.value =
            savedDetails.city || "";
        }

        if (customerState) {
          customerState.value =
            savedDetails.state || "";
        }

        if (customerPincode) {
          customerPincode.value =
            savedDetails.pincode || "";
        }

        if (customerLandmark) {
          customerLandmark.value =
            savedDetails.landmark || "";
        }

        const requiredDetailsExist =
          savedDetails.name &&
          savedDetails.phone &&
          savedDetails.address &&
          savedDetails.city &&
          savedDetails.state &&
          savedDetails.pincode;

        if (requiredDetailsExist) {
          displaySavedAddress(
            savedDetails
          );
        }
      } catch (error) {
        console.error(
          "Unable to load customer details:",
          error
        );
      }
    }

    function displaySavedAddress(
      details
    ) {
      addressIsSaved = true;

      if (savedCustomerName) {
        savedCustomerName.textContent =
          details.name ||
          "Customer";
      }

      if (savedCustomerPhone) {
        savedCustomerPhone.textContent =
          details.phone || "";
      }

      if (savedAddressText) {
        savedAddressText.textContent =
          [
            details.address,
            details.landmark,
            details.city,
            details.state,
            details.pincode
          ]
            .filter(Boolean)
            .join(", ");
      }

      if (savedAddressCard) {
        savedAddressCard.hidden =
          false;
      }

      addressFormSection?.classList.add(
        "is-hidden"
      );
    }

    function showAddressForm() {
      addressIsSaved = false;

      if (savedAddressCard) {
        savedAddressCard.hidden =
          true;
      }

      addressFormSection?.classList.remove(
        "is-hidden"
      );
    }

    const customerFields = [
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerState,
      customerPincode,
      customerLandmark
    ].filter(Boolean);

    customerFields.forEach(
      function (field) {
        field.addEventListener(
          "change",
          function () {
            saveCustomerDetails();
          }
        );
      }
    );

    saveAddressButton?.addEventListener(
      "click",
      function () {
        const details =
          getCustomerDetails();

        if (details.name.length < 2) {
          showMessage(
            "Enter your full name.",
            true
          );

          customerName?.focus();
          return;
        }

        if (
          !/^[6-9]\d{9}$/.test(
            details.phone
          )
        ) {
          showMessage(
            "Enter a valid 10-digit mobile number.",
            true
          );

          customerPhone?.focus();
          return;
        }

        if (!details.address) {
          showMessage(
            "Enter your delivery address.",
            true
          );

          customerAddress?.focus();
          return;
        }

        if (!details.city) {
          showMessage(
            "Enter your city.",
            true
          );

          customerCity?.focus();
          return;
        }

        if (!details.state) {
          showMessage(
            "Enter your state.",
            true
          );

          customerState?.focus();
          return;
        }

        if (
          !/^\d{6}$/.test(
            details.pincode
          )
        ) {
          showMessage(
            "Enter a valid 6-digit PIN code.",
            true
          );

          customerPincode?.focus();
          return;
        }

        saveCustomerDetails();

        displaySavedAddress(
          details
        );

        showMessage(
          "Address saved successfully."
        );
      }
    );

    editAddressButton?.addEventListener(
      "click",
      showAddressForm
    );

    /* =================================
       RENDER CHECKOUT
    ================================= */

    function renderCheckout() {
      if (checkoutLoading) {
        checkoutLoading.hidden =
          true;
      }

      if (
        !Array.isArray(checkoutCart) ||
        checkoutCart.length === 0
      ) {
        if (checkoutLayout) {
          checkoutLayout.hidden =
            true;
        }

        if (checkoutSuccess) {
          checkoutSuccess.hidden =
            true;
        }

        if (checkoutEmpty) {
          checkoutEmpty.hidden =
            false;
        }

        updatePageState();
        return;
      }

      if (checkoutEmpty) {
        checkoutEmpty.hidden =
          true;
      }

      if (checkoutSuccess) {
        checkoutSuccess.hidden =
          true;
      }

      if (checkoutLayout) {
        checkoutLayout.hidden =
          false;
      }

      if (!checkoutProducts) {
        updatePageState();
        return;
      }

      checkoutProducts.innerHTML =
        "";

      checkoutCart.forEach(
        function (product) {
          const quantity =
            getQuantity(product);

          const sellingPrice =
            getSellingPrice(product);

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
                  getProductName(product)
                )}"
              >
            </div>

            <div class="checkout-product-info">
              <h3>
                ${escapeHTML(
                  getProductName(product)
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

          image?.addEventListener(
            "error",
            function () {
              image.src =
                "images/image-placeholder.png";
            },
            {
              once: true
            }
          );

          checkoutProducts.appendChild(
            productElement
          );
        }
      );

      const totals =
        getCheckoutTotals();

      if (checkoutOriginalPrice) {
        checkoutOriginalPrice.textContent =
          formatPrice(
            totals.originalAmount
          );
      }

      if (checkoutDiscount) {
        checkoutDiscount.textContent =
          `− ${formatPrice(
            totals.discountAmount
          )}`;
      }

      if (checkoutTotal) {
        checkoutTotal.textContent =
          formatPrice(
            totals.totalAmount
          );
      }

      if (checkoutSavings) {
        checkoutSavings.textContent =
          totals.discountAmount > 0
            ? `You saved ${formatPrice(
                totals.discountAmount
              )} on this order`
            : "";
      }

      updatePageState();
    }

    /* =================================
       PAYMENT METHOD
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
       PREPARE DATABASE ITEMS
    ================================= */

    function prepareOrderItems() {
      return checkoutCart.map(
        function (product) {
          const quantity =
            getQuantity(product);

          const price =
            getSellingPrice(product);

          const oldPrice =
            getOriginalPrice(product);

          return {
            product_id:
              getProductId(product),

            name:
              getProductName(product),

            product_name:
              getProductName(product),

            image_url:
              getImage(product),

            image:
              getImage(product),

            quantity,

            price,

            old_price:
              oldPrice,

            line_total:
              price * quantity
          };
        }
      );
    }

    /* =================================
       PLACE ORDER IN SUPABASE
    ================================= */

    checkoutForm?.addEventListener(
      "submit",
      async function (event) {
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

        if (
          typeof supabaseClient ===
          "undefined"
        ) {
          showMessage(
            "Supabase is not connected. Check supabase-config.js.",
            true
          );

          return;
        }

        const customerDetails =
          getCustomerDetails();

        if (
          customerDetails.name.length <
          2
        ) {
          showMessage(
            "Enter your full name.",
            true
          );

          showAddressForm();
          customerName?.focus();
          return;
        }

        if (
          !/^[6-9]\d{9}$/.test(
            customerDetails.phone
          )
        ) {
          showMessage(
            "Enter a valid 10-digit mobile number.",
            true
          );

          showAddressForm();
          customerPhone?.focus();
          return;
        }

        if (
          !customerDetails.address
        ) {
          showMessage(
            "Enter your delivery address.",
            true
          );

          showAddressForm();
          customerAddress?.focus();
          return;
        }

        if (!customerDetails.city) {
          showMessage(
            "Enter your city.",
            true
          );

          showAddressForm();
          customerCity?.focus();
          return;
        }

        if (!customerDetails.state) {
          showMessage(
            "Enter your state.",
            true
          );

          showAddressForm();
          customerState?.focus();
          return;
        }

        if (
          !/^\d{6}$/.test(
            customerDetails.pincode
          )
        ) {
          showMessage(
            "Enter a valid 6-digit PIN code.",
            true
          );

          showAddressForm();
          customerPincode?.focus();
          return;
        }

        const paymentMethod =
          document.querySelector(
            'input[name="paymentMethod"]:checked'
          )?.value ||
          "Cash on Delivery";

        if (paymentMethod === "UPI") {
          showMessage(
            "UPI payment is not connected yet. Select Cash on Delivery.",
            true
          );

          return;
        }

        setPlaceOrderLoading(true);

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
            throw new Error(
              "Please login before placing your order."
            );
          }

          const user =
            userData.user;

          const accountType =
            user.user_metadata
              ?.account_type;

          if (accountType === "admin") {
            throw new Error(
              "Admin accounts cannot place customer orders."
            );
          }

          saveCustomerDetails();

          const totals =
            getCheckoutTotals();

          const orderNumber =
            generateOrderNumber();

          const shippingAddress = {
            name:
              customerDetails.name,

            phone:
              customerDetails.phone,

            address:
              customerDetails.address,

            city:
              customerDetails.city,

            state:
              customerDetails.state,

            pincode:
              customerDetails.pincode,

            landmark:
              customerDetails.landmark
          };

          const orderItems =
            prepareOrderItems();

          const orderData = {
            user_id:
              user.id,

            order_number:
              orderNumber,

            customer_name:
              customerDetails.name,

            customer_phone:
              customerDetails.phone,

            shipping_address:
              shippingAddress,

            items:
              orderItems,

            payment_method:
              paymentMethod,

            original_amount:
              totals.originalAmount,

            discount_amount:
              totals.discountAmount,

            total_amount:
              totals.totalAmount,

            status:
              "Order Placed"
          };

          console.log(
            "Saving order to Supabase:",
            orderData
          );

          const {
            data: insertedOrder,
            error: orderError
          } =
            await supabaseClient
              .from("orders")
              .insert(orderData)
              .select()
              .single();

          if (orderError) {
            throw orderError;
          }

          console.log(
            "Order saved successfully:",
            insertedOrder
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

          if (checkoutSuccessMessage) {
            checkoutSuccessMessage.textContent =
              `Thank you, ${customerDetails.name}. Your order ID is ${orderNumber}.`;
          }

          updatePageState();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        } catch (error) {
          console.error(
            "Unable to place order:",
            error
          );

          const message =
            String(
              error?.message ||
              "Unable to place your order."
            );

          if (
            message
              .toLowerCase()
              .includes(
                "row-level security"
              )
          ) {
            showMessage(
              "Order permission was blocked by Supabase. Run the orders RLS policies provided above.",
              true
            );
          } else if (
            message
              .toLowerCase()
              .includes(
                "column"
              )
          ) {
            showMessage(
              `Orders table error: ${message}`,
              true
            );
          } else {
            showMessage(
              message,
              true
            );
          }
        } finally {
          setPlaceOrderLoading(false);
        }
      }
    );

    /* =================================
       START
    ================================= */

    checkoutCart =
      readCheckoutCart();

    loadCustomerDetails();

    renderCheckout();

    updatePageState();
  }
);
