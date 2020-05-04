$(function(){

    let alert   =   $('.jsAlert'),
        log     =   alert.find('.log'),
        bWrap   =   $('.jsImportButtonsWrap'),
        body    =   $('.jsBody'),
        content =   $('.jsContent'),
        footer  =   $('.jsFooter'),
        copy    =   $('.jsCopy');

    setContentMinHeight();
    setCopyrightWidth();

    $(window).resize(function(){
        setContentMinHeight();
        setCopyrightWidth();
    });

    /**
     * слушаем клики по импортам
     */
    $(document).on('click','.jsImport',function(e){
        let button  =   $(this),
            fileName=   button.attr('data-file'),
            fileType=   button.attr('data-type'),
            path    =   button.closest('.jsImportButtonsWrap').attr('data-action');
        e.preventDefault();
        clearImportLog();
        restartAllButtons();
        setImportLogTitle('Импорт файла '+fileName);
        triggerButtonStatus(button,'process');
        clearFocus();
        $.ajax({
            type:       'POST',
            url:        path,
            data:       {fileName:fileName},
            cache:      false,
            dataType:   'json',
            success:    function(data){
                if(data.status==='ok'){
                    runImport(data.import);
                    addImportLogRow('Начинаю импорт');
                    alert.show();
                }else{
                    addImportLogRow('Ошибка при копировании файла '+fileName);
                    addImportLogRow('error Импорт прерван из-за ошибки.');
                    triggerImportLogStatus('danger');
                    alert.show();
                    triggerButtonStatus(button,'error');
                }
            }
        });
    });

    /**
     * отправляет запросы импорта на сервер
     * @param fileName
     */
    function runImport(fileName){
        let button  =   bWrap.find('.jsImport[data-file="'+fileName+'"]');
        $.ajax({
            type:       'GET',
            url:        '/bitrix/admin/1c_exchange.php?type=catalog&mode=import&filename='+fileName,
            cache:      false,
            dataType:   'html',
            success:    function(data){
                if(data.indexOf('Авторизация')>1){
                    addImportLogRow('Проблема с авторизацией!');
                    addImportLogRow('Необходимо авторизоваться под пользователем имеющим право на обмен с 1С.');
                    addImportLogRow('error Импорт прерван из-за ошибки.');
                    triggerImportLogStatus('danger');
                    triggerButtonStatus(button,'error');
                }else if(data.indexOf('Импорт успешно завершен')<1){
                    addImportLogRow(data);
                    setTimeout(function(){
                        runImport(fileName);
                    },500);
                }else{
                    addImportLogRow(data);
                    triggerButtonStatus(button,'finish');
                }
            }
        });
    }

    /**
     * меняет статус кнопки
     * @param button
     * @param status
     */
    function triggerButtonStatus(button,status){
        if(status==='finish'){
            restartAllButtons();
            button.addClass('btn-outline-success').removeClass('btn-outline-info').prepend('<span class="jsIcon mr5"><i class="fa fa-check"></i></span>');
        }
        if(status==='process'){
            restartAllButtons();
            button.addClass('btn-success').removeClass('btn-outline-info').prepend('<span class="jsSpinner spinner-border spinner-border-sm mr5" role="status" aria-hidden="true"></span>');
        }
        if(status==='error'){
            restartAllButtons();
            button.addClass('btn-outline-danger').removeClass('btn-outline-info').prepend('<span class="jsError mr5"><i class="fa fa-exclamation-triangle"></i></span>');
        }
    }

    /**
     * сбрасывает стиль кнопок в дефолтное состояние
     */
    function restartAllButtons(){
        bWrap.find('.jsImport').removeClassWild('btn-*');
        bWrap.find('.jsImport').addClass('btn-outline-info');
        bWrap.find('.jsImport').find('.jsSpinner').remove();
        bWrap.find('.jsImport').find('.jsIcon').remove();
        bWrap.find('.jsImport').find('.jsError').remove();
    }

    /**
     * устанавливает заголовок лога
     * @param title
     */
    function setImportLogTitle(title=''){
        alert.find('.jsAlertTitle').text(title);
    }

    /**
     * добавляет строку в лог
     * @param rowText
     */
    function addImportLogRow(rowText){
        log.append('<li>'+rowText+'</li>');
    }

    /**
     * очищает лог
     */
    function clearImportLog(){
        alert.hide();
        setImportLogTitle();
        triggerImportLogStatus();
        log.html('');
    }

    /**
     * меняет статус лога
     * @param status
     */
    function triggerImportLogStatus(status='info'){
        alert.addClass('alert-'+status);
        alert.removeClassWild('alert-*');
        alert.addClass('alert-'+status);
    }

    /**
     * снимает фокус с кнопки
     */
    function clearFocus(){
        if(!$('.jsFocus').length){
            body.append('<a href="#" class="jsFocus focusItem">');
        }
        body.find('.jsFocus').focus();
    }

    /**
     * устанавливает минимальную высоту контента
     */
    function setContentMinHeight(){
        let h   =   footer.innerHeight();
        content.css('min-height','calc(100vh - '+h+'px)');
    }

    /**
     * устанавливает параметры отступов копирайта
     */
    function setCopyrightWidth(){
        let h   =   footer.innerHeight();
        copy.css({'width':h,'bottom':((h/2)-10),'right':((h/2)-15)*-1});
    }

    /**
     * расширяе возможности jQuery
     * дает возможность удаления классов по маске
     * @param mask
     * @returns {*}
     */
    $.fn.removeClassWild=   function(mask){
        return this.removeClass(function(index,cls){
            let re  = mask.replace(/\*/g,'\\S+');
            return  (cls.match(new RegExp('\\b'+re+'','g'))||[]).join(' ');
        });
    };
});