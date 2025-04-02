import AWS from "aws-sdk";

// Configurar as credenciais do S3
const s3 = new AWS.S3({
	accessKeyId: "ASIA6ODU7GZ6BY5D7AIK",
	secretAccessKey: "SUa/I/0vSKtbfbYbHT9Zpx2ciq6RBAH0upXdFHii",
	region: "us-east-1",
});

export default s3;
