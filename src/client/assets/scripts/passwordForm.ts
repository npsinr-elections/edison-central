/**
 * Handles user login/register requests, and display of errors.
 *
 */

$(() => {
  const passwordForm = $(".form-signin") as JQuery<HTMLFormElement>;
  const passwordInput = $("#inputPassword");
  const errorDisplay = $("#errorDisplay");
  const errorTitle = $("#errorTitle");
  const errorDetail = $("#errorDetail");
  passwordForm.submit((e) => {
    errorDisplay.hide("fast");
    $.ajax({
      data: passwordForm.serialize(),
      error: (res) => {
        const error = $.parseJSON(res.responseText).errors[0];
        errorTitle.text(error.title);
        errorDetail.text(error.detail);
        errorDisplay.show("fast");
        passwordInput.val("");
        passwordInput.focus();
      },
      success: (_1) => {
        window.location.href = "/"; // Redirect to home
      },
      type: "POST",
      url: passwordForm.attr("action"),

    });

    e.preventDefault();
  });
});
