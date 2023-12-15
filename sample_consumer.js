
require("dotenv").config()
const { kafka_instance } = require("./config")

const topics = process.env?.KAFKA_TOPIC?.toString().trim().split(" ") || []

const consumer = async () => {
    const consumer = kafka_instance.consumer({ groupId: 'test-group' })

    await consumer.connect()
    await consumer.subscribe({ topics, fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                topic: topic,
                value: message.value.toString(),
            })
        },
    })
}
consumer()
