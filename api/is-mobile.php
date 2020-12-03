<?php

if ($_SERVER["HTTP_REFERER"] !== "https://polify.niekes.com/") {
    http_response_code(403);
    echo "";
    return;
}

require_once './MobileDetect.php';
$detect = new Mobile_Detect;

$myObj->isMobile = $detect->isMobile();
$myObj->isTablet = $detect->isTablet();

$myJSON = json_encode($myObj);

echo $myJSON;
?>
