
const axios = require("axios")
const { Kafka, logLevel } = require("kafkajs")

const binance_socket_base_url = "wss://fstream.binance.com"

const bybit_linear_socket_base_url = "wss://stream.bybit.com/v5/public/linear"

const delta_socket_base_url = "wss://socket.delta.exchange"

const deribit_rest_base_url = "https://www.deribit.com/api/v2"
const deribit_socket_base_url = "wss://streams.deribit.com/ws/api/v2"

const okx_socket_base_url = "wss://ws.okx.com:8443/ws/v5/public"

const deribit_rest_instance = axios.create({
    baseURL: deribit_rest_base_url,
    timeout: 30000
})

const kafka_instance = new Kafka({
    clientId: process.env?.KAFKA_CLIENT_ID?.toString().trim(),
    brokers: ['0.0.0.0:9092'],
    logLevel: logLevel.ERROR,
    retry: {
        initialRetryTime: 5000,
        restartOnFailure: true
    }
})

module.exports = {
    binance_socket_base_url,
    bybit_linear_socket_base_url,
    delta_socket_base_url,
    deribit_rest_base_url,
    deribit_rest_instance,
    deribit_socket_base_url,
    okx_socket_base_url,
    kafka_instance
}
