import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
const PUBLIC_KEY =
  "pk_test_51NZvZdAYF8m6Yfq3cagcot5OzCDeyyQ08hNFoxmsnPf2LAxccmTRflQzxgzhWOaL1BOZvnyUFkYDIt2HaRZ3qAT3007fEd9rRq";
const stripePromise = loadStripe(PUBLIC_KEY);
const StripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default StripeContainer;
