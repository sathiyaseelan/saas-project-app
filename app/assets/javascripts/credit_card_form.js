// fucntion to get param from url
  var getURLParameter = function(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam)
      {
        return sParameterName[1];
      }
    }
  };


$(document).ready(function() {
  var show_error, stripeResponseHandler, submitHandler, clear_card_details;

//function to handle form submission & intercept default submission
  submitHandler = function (event){
      var $form = $(event.target);
      $form.find("input[type=submit]").prop('disable',true);
      if(Stripe){
        Stripe.card.createToken($form, stripeResponseHandler);
      } else {
        show_error("Failed to load credit card processing functionality. Pleae try reload this page.")
      }
      return false;
  };

//Initiate submit handler listener for any form with cc_form class
    $('.cc_form').on('submit', submitHandler);

//handle event for plan drop down changing
  var handlePlanChange = function(plan_type, form){
    var $form = $(form);
    if (plan_type == undefined){
      plan_type = $('tenant_plan :selected').val();
    }
    
    if(plan_type === 'premium'){
      $('[data-stripe]').prop('required',true);
      $form.off('submit');
      $form.on('submit', submitHandler);
      $('[data-stripe]').show();
    }else{
      $('[data-stripe]').hide();
      $form.off('submit');
      $('[data-stripe]').removeProp('required');
    }
  };

//setup plan change event listener #tenant_plan id in the cc_form
  $('#tenant_plan').on('change', function(){
    handlePlanChange($('#tenant_plan :selected').val(), $('.cc_form'));
  });
  
//call plan change handler so that the plan is correctly set while the page is loaded
  handlePlanChange(getURLParameter('plan'),'.cc_form');

//function to handle token received from Stripe and to remove credit card fields\
  stripeResponseHandler = function (status, response) {
    var token,$form;
    $form = $('.cc_form');
    
    if (response.error){
        console.log(response.error.message);
        show_error(response.error.message);
        $form.find('input[type=submit]').prop('disable',false);
    }else{ 
      token = response.id;
      $form.append($("<input type='hidden' name='payment[token]' />").val(token));
      clear_card_details();
      $form.get(0).submit();
        
    }
    return false;
  };

  clear_card_details = function(){
    $("[data-stripe=number]").remove();
    $("[data-stripe=cvv]").remove();
    $("[data-stripe=exp-year]").remove();
    $("[data-stripe=exp-month]").remove();
    $("[data-stripe=label]").remove();
  };

//Function to show errors
  show_error = function(message) {
    if($("#flash-messages").size() < 1){
      console.log('flash-messages <1');
      $('div.container div.row').prepend("<div id='flash-messages'></div>");
    }
    $('#flash-messages').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><div id="flash_alert">'+ message + '</div></div>');
    // $('.alert').delay(5000).fadeOut(3000);
     return false;
  };
    
});
