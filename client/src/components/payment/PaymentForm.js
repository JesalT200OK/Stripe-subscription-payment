import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
//Card options for selection box for select dropdown
const CARD_OPTIONS = {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "white",
      color: "#fff",
      fontWeight: 500,
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      ":-webkit-autofill": { color: "#fce883" },
      "::placeholder": { color: "#ffffffa8" },
    },
    invalid: {
      iconColor: "#ff5c49",
      color: "#ff5c49",
    },
  },
};

const PaymentForm = () => {
  const [success, setSuccess] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentRequestObject, setPaymentRequestObject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  //Subscription option with price id generated from stripe products dashboard
  const subscriptionOptions = [
    {
      price_id: "price_1NaCTZAYF8m6Yfq38jTKGjNB",
      value: "5",
      label: "Monthly subscription of $5",
    },
    {
      price_id: "price_1NaCUPAYF8m6Yfq37SLQU5J7",
      value: "50",
      label: "Annual subscription of $50",
    },
    {
      price_id: "price_1NbJBQAYF8m6Yfq3sQwgg2rV",
      value: "500",
      label: "Non-recurring lifetime single payment of $500",
    },
  ];

  //creating initial payment request with default values which will updated when user select subscription
  useEffect(() => {
    if (!stripe) {
      return;
    }
    const paymentRequest = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: {
        label: "Demo total",
        amount: 500,
      },
    });
    setPaymentRequestObject(paymentRequest);
  }, [stripe]);

  useEffect(() => {
    if (!stripe || !selectedSubscription) {
      return;
    }
    //Below code will update every time when user choose subscription
    paymentRequestObject.update({
      total: {
        label: "Demo total",
        amount: parseInt(selectedSubscription.value) * 100,
      },
    });
    //Below code will check whether user have apple pay, google pay or link support
    paymentRequestObject.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(paymentRequestObject);
      }
    });
    paymentRequestObject._callbacks.paymentmethod = [];
    paymentRequestObject.on("paymentmethod", async (ev) => {
      try {
        const response = await axios.post(
          "https://testnewapi-ytvv.onrender.com/pay",
          {
            amount: selectedSubscription.value * 100, //stipe use cents so we need to convert by multiply 100
            id: ev.paymentMethod.id,
            priceId: selectedSubscription.price_id,
          }
        );
        if (response.status == 200) {
          const data = await response.data;
          const confirmPayment = await stripe.confirmCardPayment(
            data.clientSecret
          );
          const { paymentIntent } = confirmPayment;
          if (paymentIntent.status === "succeeded") {
            ev.complete("success");
            setSuccess(true);
            toast.success("Successful payment done");
          } else toast.error(`There was an error in payment!`);
        } else {
          toast.error("There was an error in payment!");
        }
      } catch (err) {
        toast.error("Unable to process the payment");
      }
    });
  }, [selectedSubscription]);

  const handleChange = (selectedOption) => {
    setSelectedSubscription(selectedOption);
  };

  //Pay will call when user click on pay now button
  const pay = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement),
    });
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://testnewapi-ytvv.onrender.com/pay",
        {
          amount: selectedSubscription.value * 100,
          id: paymentMethod.id,
          priceId: selectedSubscription.price_id,
        }
      );
      if (response.status == 200) {
        const data = await response.data;
        const cardElement = elements.getElement(CardNumberElement);
        const confirmPayment = await stripe.confirmCardPayment(
          data.clientSecret,
          { payment_method: { card: cardElement } }
        );
        const { paymentIntent } = confirmPayment;
        if (paymentIntent.status === "succeeded") {
          setSuccess(true);
          setIsLoading(false);
          toast.success("Successful payment done");
        } else toast.error(`There was an error in payment!`);
      } else {
        toast.error("There was an error in payment!");
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(err?.response?.data?.message);
    }
  };
  return (
    <>
      {!success ? (
        <form onSubmit={pay}>
          <div>
            <Select
              options={subscriptionOptions}
              onChange={handleChange}
              isSearchable={false}
              autoFocus={true}
              required={true}
            />
          </div>
          <div className="card-element">
            <CardNumberElement options={CARD_OPTIONS} />
          </div>
          <div className="sub-card-elements">
            <div className="card-element card-expire">
              <CardExpiryElement options={CARD_OPTIONS} />
            </div>
            <div className="card-element card-cvv">
              <CardCvcElement options={CARD_OPTIONS} />
            </div>
          </div>
          {selectedSubscription && (
            <div className="payment-details">
              Amount: ${selectedSubscription?.value || 0}
            </div>
          )}
          <div className="pay-btn">
            <button>{isLoading ? "Processing" : "PAY NOW"}</button>
          </div>
          {paymentRequest && (
            <div className="g-pay">
              <p>OR PAY USING WALLETS</p>
              <PaymentRequestButtonElement options={{ paymentRequest }} />
            </div>
          )}
        </form>
      ) : (
        <div className="done-payment">
          <img src={process.env.PUBLIC_URL + "/done.jpg"} />
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ToastContainer />
    </>
  );
};
export default PaymentForm;
