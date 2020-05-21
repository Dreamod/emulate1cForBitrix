<?
$fileName   =   $_REQUEST['fileName'];
include(__DIR__.'/core.php');
if(!$fileName){?>
    <!DOCTYPE html>
    <html lang="ru">
        <head>
            <title>Эмулятор 1Сника</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
            <link rel="stylesheet" href="<?=$arConfig['assetsDir']?>style.css">
            <script src="https://use.fontawesome.com/d3ff013f83.js"></script>
            <script src="https://yastatic.net/jquery/3.3.1/jquery.js"></script>
            <script src="<?=$arConfig['assetsDir']?>script.js?g=ttt"></script>
        </head>
        <body class="jsBody">
            <div class="container jsContent pt50 pt-xs-30">
                <div class="row">
                    <div class="col-12 col-sm-6">
                        <h1>Эмулятор 1Сника</h1>
                    </div>
                    <div class="col-12 col-sm-6">
                        <div class="timerWrap jsTimerWrap">
                            <div class="timer jsTimer">
                                <div class="timerItem jsHour">00</div>
                                <div class="timerSpacer">:</div>
                                <div class="timerItem jsMin">00</div>
                                <div class="timerSpacer">:</div>
                                <div class="timerItem jsSec">00</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-5">
                        <div data-action="<?=$arConfig['relPath']?>" class="btn-group-vertical btn-group-sm mt40 mt-xs-20 jsImportButtonsWrap w100">
                            <?if($arConfig['arFiles']['xml']){?>
                                <span class="btn btn-xs btn-outline-dark disabled tl">.xml файлы</span>
	                            <?foreach($arConfig['arFiles']['xml'] as $file){?>
                                    <a href="#" class="jsImport btn btn-outline-info tl" data-file="<?=$file?>" data-type="xml"><span><?=$file?></span></a>
	                            <?}?>
                            <?}?>
	                        <?if($arConfig['arFiles']['zip']){?>
                                <span class="btn btn-xs btn-outline-dark disabled tl">.zip файлы</span>
		                        <?foreach($arConfig['arFiles']['zip'] as $file){?>
                                    <a href="#" class="jsImport btn btn-outline-info tl" data-file="<?=$file?>" data-type="zip"><span><?=$file?></span></a>
		                        <?}?>
	                        <?}?>
                        </div>
                    </div>
                    <div class="col-12 col-lg-7">
                        <div class="alert jsAlert mt40 mt-xs-20 alert-info" role="alert" style="display:none;">
                            <h4 class="jsAlertTitle alert-heading"></h4><hr>
                            <ol class="log"></ol>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer jsFooter">
                <div class="container">
                    <div class="row">
                        <div class="col-11">
                            <h5>Эмулятор 1Сника</h5>
                            <ul>
                                <li>Тулза позволяет эмулировать поведение 1С при обмене с сайтом</li>
                                <li>Вы должны быть авторизованы под юзером имеющим право на обмен</li>
                                <li>Файлы импорта нужно положить в папку <?=$arConfig['relImportDir']?></li>
                                <li>При импорте копирует папку <?=$arConfig['relImportFilesDir']?> в <?=$arConfig['relBitrixDir']?>import_files/</li>
                                <li>*Пока не умеет работать с .zip файлами</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <a href="https://github.com/Dreamod/emulate1cForBitrix" target="_blank" class="jsCopy copyright">Dreamod <i class="fa fa-github"></i></a>
            </div>
        </body>
    </html>
<?}else{
	$arResult   =   [
		'status'=>  'error',
		'import'=>  $fileName
	];
	if(copy($arConfig['importDir'].$fileName,$arConfig['absBitrixDir'].$fileName)){
		if(file_exists($arConfig['importFilesDir'])){
			recursiveCopy($arConfig['importFilesDir'],$arConfig['absBitrixDir'].'import_files/');
        }
		$arResult   =   [
			'status'=>  'ok',
			'import'=>  $fileName
		];
	}
	echo json_encode($arResult);
}?>
