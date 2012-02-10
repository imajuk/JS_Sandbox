
$(function()
{
    //----------------------------------------------------
    // add sample texts in each type face.
    //----------------------------------------------------
    var sampleText = 'Grumpy wizards make toxic brew for the evil Queen and Jack.';
    $('.sample')
        .append('<p class="large">'  +sampleText)
        .append('<p class="middium">'+sampleText)
        .append('<p class="small">'  +sampleText);
    
    $('.header').accordion_header();
    $('a[href*=#]').scrollToAnchor({useScrollToAnchor:true});
});
