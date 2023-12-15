
require("dotenv").config()

const EventEmitter = require("events")

const kafka_producer = require("./store/producer.js")
const create_topic = require("./store/topic")

const binance_future_socket = require("./binance/future")
const bybit_future_socket = require("./bybit/future")
const delta_future_socket = require("./delta/future")
const deribit_future_socket = require("./deribit/future")
const okx_future_socket = require("./okx/future")

const main = async () => {
    global.APP_EVENTS = new EventEmitter()
    console.log("process.env.KAFKA_CLIENT_ID:- ", process.env.KAFKA_CLIENT_ID)
    await create_topic()
    await kafka_producer()

    binance_future_socket()
    bybit_future_socket()
    delta_future_socket()
    deribit_future_socket()
    okx_future_socket()
}
main()
