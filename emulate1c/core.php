<?
$absPath    =   __DIR__.'/';
$relPath    =   str_replace($_SERVER['DOCUMENT_ROOT'],'',__DIR__).'/';
$arConfig   =   [
	'absPath'           =>  $absPath,
	'relPath'           =>  $relPath,
	'importDir'         =>  $absPath.'import/',
	'importFilesDir'    =>  $absPath.'import/files/',
	'relImportDir'      =>  $relPath.'import/',
	'relImportFilesDir' =>  $relPath.'import/files/',
	'assetsDir'         =>  $relPath.'assets/',
	'absBitrixDir'      =>  $_SERVER['DOCUMENT_ROOT'].'/upload/1c_catalog/',
	'relBitrixDir'      =>  '/upload/1c_catalog/'
];
$arFiles=   scandir($arConfig['importDir']);
foreach($arFiles as $fKey=>$file){
	if(strpos($file,'.xml')!==false){
		$arConfig['arFiles']['xml'][]   =   $file;
	}
	if(strpos($file,'.zip')!==false){
		$arConfig['arFiles']['zip'][]   =   $file;
	}
}
unset($arFiles);

/**
 * рукурсивное копирвоание папки
 * @param $sourceDir
 * @param $destDir
 */
function recursiveCopy($sourceDir,$destDir){
	if(!file_exists($destDir)){
		mkdir($destDir,0755,true);
	}
	$dirIterator=   new RecursiveDirectoryIterator($sourceDir,RecursiveDirectoryIterator::SKIP_DOTS);
	$iterator   =   new RecursiveIteratorIterator($dirIterator,RecursiveIteratorIterator::SELF_FIRST);
	foreach($iterator as $object){
		$destPath   =   $destDir.DIRECTORY_SEPARATOR.$iterator->getSubPathName();
		($object->isDir())?mkdir($destPath):copy($object,$destPath);
	}
}