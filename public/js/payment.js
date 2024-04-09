
const stripe = Stripe('pk_test_51MsUoDLJWTnMXDYA2ODpXj0ojZa2ZWOgIA9zHDo4lcPR0HdDO91BNuHMpXkKS7TnGf49o0wfPwYe5zaibYfWgVb20012pbAjuY');

const submitHandler = () => {
  const paymentForm = document.getElementById("paymentForm");
  const paymentToken = document.getElementById("paymentToken");

  const cardNumber = document.getElementById('cardNumber').value;
  const cardExpiryMonth = document.getElementById('cardExpiryMonth').value;
  const cardExpiryYear = document.getElementById('cardExpiryYear').value;
  const CVC = document.getElementById('cardCVC').value;

  stripe.createToken('card', {
    number: cardNumber,
    exp_month: cardExpiryMonth,
    exp_year: cardExpiryYear,
    cvc: CVC
  }).then(function(result) {
    alert(result.token.id);
    paymentToken.value = result.token.id;
    // paymentForm.submit();
  })
  .catch(err => {
    console.log(err);
  });

}