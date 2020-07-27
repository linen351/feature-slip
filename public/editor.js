(function () {

  window.Handlebars.registerHelper('select', function (value, settings) {
    let $el = $('<select />').html(settings.fn(this));
    $el.find('[value="' + value + '"]').attr({ 'selected': 'selected' });
    return $el.html();
  });

  $('.tab-menu-wrapper>.vertical-tab-menu-wrapper>.menu>.item').tab();

  $('#templatesAndInstances>*>.item').tab();

}());

featureSlip.init();