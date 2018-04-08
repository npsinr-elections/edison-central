$(() => {
    const passwordForm = $(".form-signin") as JQuery<HTMLFormElement>;
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
            },
            success: (_1) => {
                window.location.href = "/";
            },
            type: "POST",
            url: passwordForm.attr("action"),

        });

        e.preventDefault();
    });
});
