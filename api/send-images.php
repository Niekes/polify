<?php

if ($_SERVER["HTTP_REFERER"] !== "https://polify.niekes.com/") {
    http_response_code(403);
    echo "";
    return;
}

define('UPLOAD_DIR', './images/');

if (!is_dir('images')) {
    //Create our directory if it does not exist
    mkdir('images');
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require './Exception.php';
require './PHPMailer.php';
require './SMTP.php';

$data = json_decode(file_get_contents("php://input"), true);
$img = $data['image'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$decode = base64_decode($img);
$uniqid = uniqid();
$filename = 'polify-' . $uniqid . '.png';
$file = UPLOAD_DIR . $filename;

file_put_contents($file, $decode);

$email = new PHPMailer();
$email->SetFrom('polify@niekes.com');
$email->Subject = 'Your image from polify.niekes.com';
$email->Body = "Hi,\r\n\r\nThank you for using polify.niekes.com\r\n\r\nPlease find your images attached.\r\n\r\n\r\n\r\nYour polify team";
$email->AddAddress($data["recipient"]);
$email->AddAttachment($file, $filename);

$send = $email->Send();

if ($send) {
    http_response_code(201);

    $response->send = $send;
    $response->recipient = $data["recipient"];
    $response_json = json_encode($response);

    unlink($file);

    echo $response_json;
} else {
    http_response_code(400);
    echo '';
}
?>
