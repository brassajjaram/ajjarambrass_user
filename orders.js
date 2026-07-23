document.addEventListener(
  "DOMContentLoaded",
  async function () {
    /* =================================
       ELEMENTS
    ================================= */

    const ordersPage =
      document.querySelector(
        ".orders-page"
      );

    const ordersLoading =
      document.getElementById(
        "ordersLoading"
      );

    const ordersMessage =
      document.getElementById(
        "ordersMessage"
      );

    const ordersList =
      document.getElementById(
        "ordersList"
      );

    const ordersEmpty =
      document.getElementById(
        "ordersEmpty"
      );

    const ordersSearchInput =
      document.getElementById(
        "ordersSearchInput"
      );

    const ordersFilterButton =
      document.getElementById(
        "ordersFilterButton"
      );

    const ordersFilterOptions =
      document.getElementById(
        "ordersFilterOptions"
      );

    const orderFilters =
      document.querySelectorAll(
        ".order-filter"
      );

    const orderDetailsBack =
      document.getElementById(
        "orderDetailsBack"
      );

    const orderNotSelected =
      document.getElementById(
        "orderNotSelected"
      );

    const orderDetailsContent =
      document.getElementById(
        "orderDetailsContent"
      );

    const detailsOrderNumber =
      document.getElementById(
        "detailsOrderNumber"
      );

    const detailsProductImageElement =
      document.getElementById(
        "detailsProductImageElement"
      );

    const detailsProductName =
      document.getElementById(
        "detailsProductName"
      );

    const detailsProductQuantity =
      document.getElementById(
        "detailsProductQuantity"
      );

    const detailsOrderAmount =
      document.getElementById(
        "detailsOrderAmount"
      );

    const detailsItemCount =
      document.getElementById(
        "detailsItemCount"
      );

    const detailsOrderId =
      document.getElementById(
        "detailsOrderId"
      );

    const copyOrderButton =
      document.getElementById(
        "copyOrderButton"
      );

    const detailsStatusTitle =
      document.getElementById(
        "detailsStatusTitle"
      );

    const detailsStatusDate =
      document.getElementById(
        "detailsStatusDate"
      );

    const detailsStatusIcon =
      document.getElementById(
        "detailsStatusIcon"
      );

    const detailsStatusNote =
      document.getElementById(
        "detailsStatusNote"
      );

    const detailsAddress =
      document.getElementById(
        "detailsAddress"
      );

    const detailsPhone =
      document.getElementById(
        "detailsPhone"
      );

    const detailsPaymentMethod =
      document.getElementById(
        "detailsPaymentMethod"
      );

    const detailsTotalAmount =
      document.getElementById(
        "detailsTotalAmount"
      );

    const orderStatusCard =
      document.querySelector(
        ".order-status-card"
      );

    const orderReviewSection =
      document.getElementById(
        "orderReviewSection"
      );

    const orderStars =
      document.getElementById(
        "orderStars"
      );

    const writeReviewButton =
      document.getElementById(
        "writeReviewButton"
      );

    const orderCancelSection =
      document.getElementById(
        "orderCancelSection"
      );

    const cancelOrderButton =
      document.getElementById(
        "cancelOrderButton"
      );

    const cancelOrderMessage =
      document.getElementById(
        "cancelOrderMessage"
      );

    const cancelModalOverlay =
      document.getElementById(
        "cancelModalOverlay"
      );

    const cancelModal =
      document.getElementById(
        "cancelModal"
      );

    const cancelModalClose =
      document.getElementById(
        "cancelModalClose"
      );

    const keepOrderButton =
      document.getElementById(
        "keepOrderButton"
      );

    const cancelReason =
      document.getElementById(
        "cancelReason"
      );

    const cancelModalMessage =
      document.getElementById(
        "cancelModalMessage"
      );

    const confirmCancelButton =
      document.getElementById(
        "confirmCancelButton"
      );

    /* =================================
       ORDER TRACKING ELEMENTS
    ================================= */

    const orderTrackingSection =
      document.getElementById(
        "orderTrackingSection"
      );

    const orderTrackingTimeline =
      document.getElementById(
        "orderTrackingTimeline"
      );

    const orderTrackingCurrentStatus =
      document.getElementById(
        "orderTrackingCurrentStatus"
      );

    const orderTrackingCancelled =
      document.getElementById(
        "orderTrackingCancelled"
      );

    const orderTrackingCancelledReason =
      document.getElementById(
        "orderTrackingCancelledReason"
      );

    const trackingPlacedDate =
      document.getElementById(
        "trackingPlacedDate"
      );

    const orderTrackingSteps =
      document.querySelectorAll(
        ".order-tracking-step"
      );

    /* =================================
       STATE
    ================================= */

    let orders = [];

    let activeOrder = null;

    let activeFilter = "all";

    let selectedRating = 0;

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

    function formatOrderDate(value) {
      if (!value) {
        return "Date not available";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Date not available";
      }

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      ).format(date);
    }

    function formatOrderDateTime(value) {
      if (!value) {
        return "";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      ).format(date);
    }

    function showOrdersMessage(
      message,
      isError = true
    ) {
      if (!ordersMessage) {
        return;
      }

      ordersMessage.textContent =
        message || "";

      ordersMessage.classList.toggle(
        "error",
        Boolean(isError)
      );
    }

    function clearOrdersMessage() {
      showOrdersMessage(
        "",
        false
      );
    }

    function getOrderNumber(order) {
      return (
        order?.order_number ||
        order?.order_id ||
        `AJ${String(
          order?.id || ""
        )
          .slice(-8)
          .toUpperCase()}`
      );
    }

    function getOrderStatus(order) {
      return (
        order?.status ||
        order?.order_status ||
        "Order Placed"
      );
    }

    /* =================================
       ORDER ITEM HELPERS
    ================================= */

    function getOrderItems(order) {
      const possibleItems =
        order?.items ||
        order?.order_items ||
        order?.product_items ||
        order?.cart_items ||
        [];

      if (
        Array.isArray(possibleItems)
      ) {
        return possibleItems;
      }

      if (
        typeof possibleItems ===
        "string"
      ) {
        try {
          const parsedItems =
            JSON.parse(
              possibleItems
            );

          return Array.isArray(
            parsedItems
          )
            ? parsedItems
            : [];
        } catch (error) {
          console.error(
            "Unable to parse order items:",
            error,
            possibleItems
          );

          return [];
        }
      }

      if (
        possibleItems &&
        typeof possibleItems ===
          "object"
      ) {
        return [
          possibleItems
        ];
      }

      return [];
    }

    function getFirstOrderItem(order) {
      const items =
        getOrderItems(order);

      return items[0] || {};
    }

    function getItemName(item) {
      return (
        item?.name ||
        item?.product_name ||
        item?.title ||
        item?.product?.name ||
        "Brass Product"
      );
    }

    function getItemQuantity(item) {
      const quantity =
        Number(
          item?.quantity ||
          item?.qty ||
          1
        );

      return (
        Number.isFinite(quantity) &&
        quantity > 0
      )
        ? quantity
        : 1;
    }

    function getTotalOrderQuantity(
      order
    ) {
      const items =
        getOrderItems(order);

      return items.reduce(
        function (
          totalQuantity,
          item
        ) {
          return (
            totalQuantity +
            getItemQuantity(item)
          );
        },
        0
      );
    }

    function getItemImage(item) {
      const image =
        item?.image_url ||
        item?.image ||
        item?.imageUrl ||
        item?.product_image ||
        item?.product?.image_url ||
        "images/image-placeholder.png";

      const imageValue =
        String(image || "").trim();

      if (!imageValue) {
        return "images/image-placeholder.png";
      }

      if (
        imageValue.startsWith(
          "https://"
        ) ||
        imageValue.startsWith(
          "http://"
        ) ||
        imageValue.startsWith(
          "data:"
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
          .getPublicUrl(
            cleanPath
          );

      return (
        data?.publicUrl ||
        imageValue ||
        "images/image-placeholder.png"
      );
    }

    /* =================================
       ORDER VALUE HELPERS
    ================================= */

    function getOrderTotal(order) {
      return (
        Number(
          order?.total_amount ||
          order?.total ||
          order?.grand_total ||
          order?.final_amount ||
          0
        ) || 0
      );
    }

    function getPaymentMethod(order) {
      return (
        order?.payment_method ||
        order?.paymentMethod ||
        "Cash on Delivery"
      );
    }

    /* =================================
       ADDRESS HELPERS
    ================================= */

    function getAddressObject(order) {
      const address =
        order?.shipping_address ||
        order?.delivery_address ||
        order?.address ||
        {};

      if (
        typeof address ===
        "string"
      ) {
        try {
          const parsedAddress =
            JSON.parse(address);

          if (
            parsedAddress &&
            typeof parsedAddress ===
              "object"
          ) {
            return parsedAddress;
          }
        } catch {
          return {
            address
          };
        }
      }

      return (
        address &&
        typeof address ===
          "object"
      )
        ? address
        : {};
    }

    function getFullAddress(order) {
      const address =
        getAddressObject(order);

      return [
        address.address,
        address.house,
        address.street,
        address.area,
        address.landmark,
        address.city,
        address.state,
        address.pincode ||
          address.pin_code ||
          address.postal_code
      ]
        .filter(Boolean)
        .join(", ") ||
        "Address not available";
    }

    function getAddressPhone(order) {
      const address =
        getAddressObject(order);

      return (
        address.phone ||
        order?.customer_phone ||
        order?.phone ||
        "Not available"
      );
    }

    /* =================================
       STATUS HELPERS
    ================================= */

    function isCancelled(order) {
      return getOrderStatus(order)
        .toLowerCase()
        .includes("cancel");
    }

    function isDelivered(order) {
      return getOrderStatus(order)
        .toLowerCase()
        .includes("delivered");
    }

    function isShipped(order) {
      const status =
        getOrderStatus(order)
          .toLowerCase();

      return (
        status.includes("shipped") ||
        status.includes(
          "out for delivery"
        ) ||
        status.includes(
          "delivered"
        )
      );
    }

    function canCancelOrder(order) {
      return (
        Boolean(order) &&
        !isCancelled(order) &&
        !isShipped(order)
      );
    }

    function getStatusNote(order) {
      const status =
        getOrderStatus(order)
          .toLowerCase();

      if (
        status.includes("cancel")
      ) {
        return order?.cancel_reason
          ? `Cancelled: ${order.cancel_reason}`
          : "This order has been cancelled.";
      }

      if (
        status.includes("delivered")
      ) {
        return "Your order has been delivered successfully.";
      }

      if (
        status.includes(
          "out for delivery"
        )
      ) {
        return "Your order is out for delivery.";
      }

      if (
        status.includes("shipped")
      ) {
        return "Your order has been shipped.";
      }

      if (
        status.includes("confirmed")
      ) {
        return "Your order has been confirmed.";
      }

      if (
        status.includes("packed")
      ) {
        return "Your order has been packed and is ready for shipping.";
      }

      if (
        status.includes("processing")
      ) {
        return "Your order is being processed.";
      }

      return "Your order is being prepared.";
    }

    /* =================================
       ORDER TRACKING HELPERS
    ================================= */

    function normalizeTrackingStatus(
      order
    ) {
      return getOrderStatus(order)
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ");
    }

    function getTrackingStep(order) {
      const status =
        normalizeTrackingStatus(
          order
        );

      if (
        status.includes(
          "delivered"
        )
      ) {
        return 5;
      }

      if (
        status.includes(
          "out for delivery"
        )
      ) {
        return 4;
      }

      if (
        status.includes(
          "shipped"
        ) ||
        status.includes(
          "dispatched"
        )
      ) {
        return 3;
      }

      if (
        status.includes(
          "confirmed"
        ) ||
        status.includes(
          "processing"
        ) ||
        status.includes(
          "packed"
        )
      ) {
        return 2;
      }

      return 1;
    }

    function getTrackingStatusName(
      order
    ) {
      if (isCancelled(order)) {
        return "Cancelled";
      }

      const currentStep =
        getTrackingStep(order);

      const statusNames = {
        1: "Order Placed",
        2: "Order Confirmed",
        3: "Shipped",
        4: "Out for Delivery",
        5: "Delivered"
      };

      return (
        statusNames[currentStep] ||
        "Order Placed"
      );
    }

    function getTrackingDate(
      order,
      stepNumber
    ) {
      const dateFields = {
        1:
          order?.created_at,

        2:
          order?.confirmed_at ||
          order?.processed_at ||
          order?.packed_at,

        3:
          order?.shipped_at ||
          order?.dispatched_at,

        4:
          order?.out_for_delivery_at,

        5:
          order?.delivered_at
      };

      return (
        dateFields[stepNumber] ||
        null
      );
    }

    function renderOrderTracking(
      order
    ) {
      if (
        !orderTrackingSection ||
        !order
      ) {
        return;
      }

      const cancelled =
        isCancelled(order);

      orderTrackingSection
        .classList.toggle(
          "is-cancelled",
          cancelled
        );

      if (
        orderTrackingCurrentStatus
      ) {
        orderTrackingCurrentStatus
          .textContent =
          getTrackingStatusName(
            order
          );
      }

      if (cancelled) {
        if (orderTrackingTimeline) {
          orderTrackingTimeline.hidden =
            true;
        }

        if (
          orderTrackingCancelled
        ) {
          orderTrackingCancelled.hidden =
            false;
        }

        if (
          orderTrackingCancelledReason
        ) {
          const reason =
            order?.cancel_reason
              ? `Reason: ${order.cancel_reason}`
              : "This order has been cancelled.";

          const cancelledDate =
            order?.cancelled_at
              ? ` ${formatOrderDateTime(
                  order.cancelled_at
                )}`
              : "";

          orderTrackingCancelledReason
            .textContent =
            `${reason}${cancelledDate}`;
        }

        return;
      }

      if (orderTrackingTimeline) {
        orderTrackingTimeline.hidden =
          false;
      }

      if (
        orderTrackingCancelled
      ) {
        orderTrackingCancelled.hidden =
          true;
      }

      const currentStep =
        getTrackingStep(order);

      orderTrackingSteps.forEach(
        function (stepElement) {
          const stepNumber =
            Number(
              stepElement.dataset
                .trackingStep
            );

          const isCompleted =
            stepNumber <
            currentStep;

          const isCurrent =
            stepNumber ===
            currentStep;

          stepElement.classList.toggle(
            "is-completed",
            isCompleted
          );

          stepElement.classList.toggle(
            "is-current",
            isCurrent
          );

          const dateElement =
            stepElement.querySelector(
              ".order-tracking-date"
            );

          const trackingDate =
            getTrackingDate(
              order,
              stepNumber
            );

          if (dateElement) {
            dateElement.textContent =
              trackingDate
                ? formatOrderDateTime(
                    trackingDate
                  )
                : "";
          }
        }
      );

      if (trackingPlacedDate) {
        trackingPlacedDate.textContent =
          formatOrderDateTime(
            order.created_at
          );
      }
    }

    /* =================================
       FILTER ORDERS
    ================================= */

    function getFilteredOrders() {
      const searchValue =
        ordersSearchInput
          ?.value
          .trim()
          .toLowerCase() || "";

      return orders.filter(
        function (order) {
          const status =
            getOrderStatus(order);

          const payment =
            getPaymentMethod(order);

          const firstItem =
            getFirstOrderItem(order);

          const allItemNames =
            getOrderItems(order)
              .map(getItemName)
              .join(" ");

          const searchableText =
            `
              ${getOrderNumber(order)}
              ${status}
              ${payment}
              ${getItemName(firstItem)}
              ${allItemNames}
              ${order.customer_name || ""}
              ${order.customer_phone || ""}
            `.toLowerCase();

          const searchMatches =
            !searchValue ||
            searchableText.includes(
              searchValue
            );

          let filterMatches =
            true;

          if (
            activeFilter ===
            "UPI"
          ) {
            filterMatches =
              payment
                .toLowerCase()
                .includes("upi");
          } else if (
            activeFilter ===
            "Cash on Delivery"
          ) {
            filterMatches =
              payment
                .toLowerCase()
                .includes("cash");
          } else if (
            activeFilter ===
            "Delivered"
          ) {
            filterMatches =
              isDelivered(order);
          } else if (
            activeFilter ===
            "Cancelled"
          ) {
            filterMatches =
              isCancelled(order);
          }

          return (
            searchMatches &&
            filterMatches
          );
        }
      );
    }

    /* =================================
       RENDER ORDERS LIST
    ================================= */

    function renderOrders() {
      if (!ordersList) {
        return;
      }

      const filteredOrders =
        getFilteredOrders();

      console.log(
        "Orders being displayed:",
        filteredOrders
      );

      ordersList.innerHTML = "";

      if (ordersEmpty) {
        ordersEmpty.hidden =
          filteredOrders.length > 0;
      }

      if (
        filteredOrders.length === 0
      ) {
        return;
      }

      filteredOrders.forEach(
        function (order) {
          const firstItem =
            getFirstOrderItem(order);

          const items =
            getOrderItems(order);

          const totalQuantity =
            getTotalOrderQuantity(order);

          const status =
            getOrderStatus(order);

          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "order-list-item";

          if (
            activeOrder?.id ===
            order.id
          ) {
            button.classList.add(
              "active"
            );
          }

          const numberOfItems =
            items.length || 1;

          button.innerHTML = `
            <span class="order-list-image">
              <img
                src="${escapeHTML(
                  getItemImage(
                    firstItem
                  )
                )}"
                alt="${escapeHTML(
                  getItemName(
                    firstItem
                  )
                )}"
                loading="lazy"
              >
            </span>

            <span class="order-list-content">

              <span class="order-list-status ${
                isCancelled(order)
                  ? "cancelled"
                  : ""
              }">
                ${escapeHTML(
                  status
                )}
                •
                ${escapeHTML(
                  formatOrderDate(
                    order.created_at
                  )
                )}
              </span>

              <h3>
                ${escapeHTML(
                  getItemName(
                    firstItem
                  )
                )}
              </h3>

              <p>
                Cart Order
                (${numberOfItems}
                ${
                  numberOfItems === 1
                    ? "item"
                    : "items"
                }
                · Qty
                ${totalQuantity || 1})
              </p>

              <strong>
                ${formatPrice(
                  getOrderTotal(order)
                )}
              </strong>

            </span>

            <span class="order-list-arrow">
              ›
            </span>
          `;

          const image =
            button.querySelector(
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

          button.addEventListener(
            "click",
            function () {
              selectOrder(order);
            }
          );

          ordersList.appendChild(
            button
          );
        }
      );
    }

    /* =================================
       SELECT ORDER
    ================================= */

    function selectOrder(order) {
      if (!order) {
        return;
      }

      activeOrder =
        order;

      selectedRating =
        0;

      updateStars();

      renderOrders();

      renderOrderDetails(
        order
      );

      ordersPage?.classList.add(
        "details-open"
      );
    }

    /* =================================
       RENDER ORDER DETAILS
    ================================= */

    function renderOrderDetails(order) {
      const items =
        getOrderItems(order);

      const firstItem =
        getFirstOrderItem(order);

      const status =
        getOrderStatus(order);

      const itemCount =
        items.length || 1;

      const totalQuantity =
        getTotalOrderQuantity(order) ||
        1;

      if (orderNotSelected) {
        orderNotSelected.hidden =
          true;
      }

      if (orderDetailsContent) {
        orderDetailsContent.hidden =
          false;
      }

      if (detailsOrderNumber) {
        detailsOrderNumber.textContent =
          getOrderNumber(order);
      }

      if (
        detailsProductImageElement
      ) {
        detailsProductImageElement.src =
          getItemImage(firstItem);

        detailsProductImageElement.alt =
          getItemName(firstItem);
      }

      if (detailsProductName) {
        detailsProductName.textContent =
          itemCount > 1
            ? `${getItemName(
                firstItem
              )} + ${
                itemCount - 1
              } more`
            : getItemName(
                firstItem
              );
      }

      if (
        detailsProductQuantity
      ) {
        detailsProductQuantity.textContent =
          `Quantity: ${totalQuantity} · Payment: ${getPaymentMethod(
            order
          )}`;
      }

      if (detailsOrderAmount) {
        detailsOrderAmount.textContent =
          formatPrice(
            getOrderTotal(order)
          );
      }

      if (detailsItemCount) {
        detailsItemCount.textContent =
          `${itemCount} ${
            itemCount === 1
              ? "item"
              : "items"
          } · Qty ${totalQuantity}`;
      }

      if (detailsOrderId) {
        detailsOrderId.textContent =
          getOrderNumber(order);
      }

      if (detailsStatusTitle) {
        detailsStatusTitle.textContent =
          status;
      }

      if (detailsStatusDate) {
        detailsStatusDate.textContent =
          formatOrderDate(
            order.created_at
          );
      }

      if (detailsStatusIcon) {
        detailsStatusIcon.textContent =
          isCancelled(order)
            ? "×"
            : "✓";
      }

      if (detailsStatusNote) {
        detailsStatusNote.textContent =
          getStatusNote(order);
      }

      orderStatusCard?.classList.toggle(
        "cancelled",
        isCancelled(order)
      );

      if (detailsAddress) {
        detailsAddress.textContent =
          getFullAddress(order);
      }

      if (detailsPhone) {
        detailsPhone.textContent =
          getAddressPhone(order);
      }

      if (detailsPaymentMethod) {
        detailsPaymentMethod.textContent =
          getPaymentMethod(order);
      }

      if (detailsTotalAmount) {
        detailsTotalAmount.textContent =
          formatPrice(
            getOrderTotal(order)
          );
      }

      if (orderReviewSection) {
        orderReviewSection.hidden =
          !isDelivered(order);
      }

      const cancellationAllowed =
        canCancelOrder(order);

      if (orderCancelSection) {
        orderCancelSection.hidden =
          !cancellationAllowed;
      }

      if (cancelOrderButton) {
        cancelOrderButton.disabled =
          !cancellationAllowed;
      }

      if (cancelOrderMessage) {
        cancelOrderMessage.textContent =
          "";
      }

      renderOrderTracking(
        order
      );
    }

    /* =================================
       LOAD ORDERS FROM SUPABASE
    ================================= */

    async function loadOrders() {
      if (ordersLoading) {
        ordersLoading.hidden =
          false;
      }

      if (ordersEmpty) {
        ordersEmpty.hidden =
          true;
      }

      if (ordersList) {
        ordersList.innerHTML =
          "";
      }

      clearOrdersMessage();

      if (
        typeof supabaseClient ===
        "undefined"
      ) {
        if (ordersLoading) {
          ordersLoading.hidden =
            true;
        }

        showOrdersMessage(
          "Supabase is not connected. Check supabase-config.js."
        );

        return;
      }

      try {
        const {
          data: sessionData,
          error: sessionError
        } =
          await supabaseClient.auth
            .getSession();

        if (sessionError) {
          throw sessionError;
        }

        let user =
          sessionData?.session?.user;

        if (!user) {
          const {
            data: userData,
            error: userError
          } =
            await supabaseClient.auth
              .getUser();

          if (userError) {
            throw userError;
          }

          user =
            userData?.user;
        }

        if (!user) {
          if (ordersLoading) {
            ordersLoading.hidden =
              true;
          }

          showOrdersMessage(
            "Please login to view your orders."
          );

          window.setTimeout(
            function () {
              window.location.href =
                "cart.html";
            },
            1200
          );

          return;
        }

        console.log(
          "Loading orders for user:",
          user.id
        );

        const {
          data,
          error
        } =
          await supabaseClient
            .from("orders")
            .select("*")
            .eq(
              "user_id",
              user.id
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

        orders =
          Array.isArray(data)
            ? data
            : [];

        console.log(
          "Orders loaded from Supabase:",
          orders
        );

        if (ordersLoading) {
          ordersLoading.hidden =
            true;
        }

        renderOrders();

        if (
          orders.length === 0
        ) {
          if (ordersEmpty) {
            ordersEmpty.hidden =
              false;
          }

          if (orderNotSelected) {
            orderNotSelected.hidden =
              false;
          }

          if (orderDetailsContent) {
            orderDetailsContent.hidden =
              true;
          }

          return;
        }

        if (
          window.innerWidth > 700
        ) {
          activeOrder =
            orders[0];

          renderOrders();

          renderOrderDetails(
            activeOrder
          );

          ordersPage?.classList.remove(
            "details-open"
          );
        }
      } catch (error) {
        console.error(
          "Unable to load orders:",
          error
        );

        if (ordersLoading) {
          ordersLoading.hidden =
            true;
        }

        if (ordersEmpty) {
          ordersEmpty.hidden =
            true;
        }

        const errorMessage =
          String(
            error?.message || ""
          );

        const lowerMessage =
          errorMessage.toLowerCase();

        if (
          lowerMessage.includes(
            "row-level security"
          ) ||
          lowerMessage.includes(
            "permission denied"
          )
        ) {
          showOrdersMessage(
            "Supabase blocked access to the orders. Check the orders RLS select policy."
          );
        } else if (
          lowerMessage.includes(
            "relation"
          ) &&
          lowerMessage.includes(
            "does not exist"
          )
        ) {
          showOrdersMessage(
            "The orders table does not exist in Supabase."
          );
        } else if (
          lowerMessage.includes(
            "column"
          ) &&
          lowerMessage.includes(
            "does not exist"
          )
        ) {
          showOrdersMessage(
            `Orders table error: ${errorMessage}`
          );
        } else {
          showOrdersMessage(
            errorMessage ||
            "Unable to load your orders."
          );
        }
      }
    }

    /* =================================
       COPY ORDER ID
    ================================= */

    copyOrderButton?.addEventListener(
      "click",
      async function () {
        if (!activeOrder) {
          return;
        }

        const orderNumber =
          getOrderNumber(
            activeOrder
          );

        try {
          await navigator.clipboard
            .writeText(
              orderNumber
            );

          copyOrderButton.textContent =
            "✓";

          window.setTimeout(
            function () {
              copyOrderButton.textContent =
                "⧉";
            },
            1000
          );
        } catch {
          window.prompt(
            "Copy order ID:",
            orderNumber
          );
        }
      }
    );

    /* =================================
       FILTER EVENTS
    ================================= */

    ordersSearchInput?.addEventListener(
      "input",
      renderOrders
    );

    orderFilters.forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            activeFilter =
              button.dataset.status ||
              "all";

            orderFilters.forEach(
              function (
                filterButton
              ) {
                filterButton.classList
                  .toggle(
                    "active",
                    filterButton ===
                      button
                  );
              }
            );

            renderOrders();
          }
        );
      }
    );

    ordersFilterButton
      ?.addEventListener(
        "click",
        function () {
          if (!ordersFilterOptions) {
            return;
          }

          ordersFilterOptions.hidden =
            !ordersFilterOptions.hidden;
        }
      );

    orderDetailsBack
      ?.addEventListener(
        "click",
        function () {
          ordersPage?.classList.remove(
            "details-open"
          );
        }
      );

    /* =================================
       RATING
    ================================= */

    function updateStars() {
      orderStars
        ?.querySelectorAll(
          "button"
        )
        .forEach(
          function (button) {
            const rating =
              Number(
                button.dataset.rating
              );

            button.classList.toggle(
              "active",
              rating <=
                selectedRating
            );
          }
        );
    }

    orderStars
      ?.querySelectorAll(
        "button"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              selectedRating =
                Number(
                  button.dataset
                    .rating
                );

              updateStars();
            }
          );
        }
      );

    writeReviewButton
      ?.addEventListener(
        "click",
        function () {
          if (!selectedRating) {
            window.alert(
              "Please select a rating."
            );

            return;
          }

          window.alert(
            `Thank you for your ${selectedRating}-star rating.`
          );
        }
      );

    /* =================================
       CANCEL MODAL
    ================================= */

    function openCancelModal() {
      if (
        !activeOrder ||
        !canCancelOrder(
          activeOrder
        )
      ) {
        return;
      }

      if (cancelReason) {
        cancelReason.value =
          "";
      }

      if (cancelModalMessage) {
        cancelModalMessage.textContent =
          "";
      }

      if (cancelModalOverlay) {
        cancelModalOverlay.hidden =
          false;
      }

      requestAnimationFrame(
        function () {
          cancelModalOverlay
            ?.classList.add(
              "is-visible"
            );

          cancelModal
            ?.classList.add(
              "is-open"
            );
        }
      );

      cancelModal?.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "cancel-modal-open"
      );
    }

    function closeCancelModal() {
      cancelModalOverlay
        ?.classList.remove(
          "is-visible"
        );

      cancelModal
        ?.classList.remove(
          "is-open"
        );

      cancelModal?.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "cancel-modal-open"
      );

      window.setTimeout(
        function () {
          if (cancelModalOverlay) {
            cancelModalOverlay.hidden =
              true;
          }
        },
        250
      );
    }

    cancelOrderButton
      ?.addEventListener(
        "click",
        openCancelModal
      );

    cancelModalClose
      ?.addEventListener(
        "click",
        closeCancelModal
      );

    keepOrderButton
      ?.addEventListener(
        "click",
        closeCancelModal
      );

    cancelModalOverlay
      ?.addEventListener(
        "click",
        closeCancelModal
      );

    /* =================================
       CONFIRM CANCELLATION
    ================================= */

    confirmCancelButton
      ?.addEventListener(
        "click",
        async function () {
          if (!activeOrder) {
            return;
          }

          const reason =
            cancelReason
              ?.value
              .trim() || "";

          if (!reason) {
            if (cancelModalMessage) {
              cancelModalMessage.textContent =
                "Please select a cancellation reason.";
            }

            return;
          }

          if (
            typeof supabaseClient ===
            "undefined"
          ) {
            if (cancelModalMessage) {
              cancelModalMessage.textContent =
                "Supabase is not connected.";
            }

            return;
          }

          if (
            !canCancelOrder(
              activeOrder
            )
          ) {
            if (cancelModalMessage) {
              cancelModalMessage.textContent =
                "This order can no longer be cancelled.";
            }

            return;
          }

          confirmCancelButton.disabled =
            true;

          confirmCancelButton.textContent =
            "Cancelling...";

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
                "Please login again before cancelling this order."
              );
            }

            const user =
              userData.user;

            const cancellationTime =
              new Date()
                .toISOString();

            const {
              data,
              error
            } =
              await supabaseClient
                .from("orders")
                .update({
                  status:
                    "Cancelled",

                  cancel_reason:
                    reason,

                  cancelled_at:
                    cancellationTime
                })
                .eq(
                  "id",
                  activeOrder.id
                )
                .eq(
                  "user_id",
                  user.id
                )
                .select()
                .single();

            if (error) {
              throw error;
            }

            const orderIndex =
              orders.findIndex(
                function (order) {
                  return (
                    order.id ===
                    activeOrder.id
                  );
                }
              );

            const updatedOrder =
              data || {
                ...activeOrder,

                status:
                  "Cancelled",

                cancel_reason:
                  reason,

                cancelled_at:
                  cancellationTime
              };

            if (orderIndex >= 0) {
              orders[orderIndex] =
                updatedOrder;
            }

            activeOrder =
              updatedOrder;

            closeCancelModal();

            renderOrders();

            renderOrderDetails(
              activeOrder
            );

            if (cancelOrderMessage) {
              cancelOrderMessage.textContent =
                "Order cancelled successfully.";
            }

            console.log(
              "Order cancelled:",
              updatedOrder
            );
          } catch (error) {
            console.error(
              "Order cancellation failed:",
              error
            );

            const errorMessage =
              String(
                error?.message || ""
              );

            if (cancelModalMessage) {
              cancelModalMessage.textContent =
                errorMessage ||
                "Unable to cancel this order.";
            }
          } finally {
            confirmCancelButton.disabled =
              false;

            confirmCancelButton.textContent =
              "Confirm Cancellation";
          }
        }
      );

    /* =================================
       IMAGE FALLBACK
    ================================= */

    detailsProductImageElement
      ?.addEventListener(
        "error",
        function () {
          detailsProductImageElement.src =
            "images/image-placeholder.png";
        }
      );

    /* =================================
       KEYBOARD EVENTS
    ================================= */

    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key ===
            "Escape" &&
          cancelModal
            ?.classList.contains(
              "is-open"
            )
        ) {
          closeCancelModal();
        }
      }
    );

    /* =================================
       START
    ================================= */

    await loadOrders();
  }
);
