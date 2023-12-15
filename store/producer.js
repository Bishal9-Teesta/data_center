
const { kafka_instance } = require("../config")

const producer = async () => {

    const producer = kafka_instance.producer({
        allowAutoTopicCreation: false,
        createPartitioner: () => {
            return ({ topic, partitionMetadata, message }) => {
                // select a partition based on some logic
                // return the partition number
                return 0
            }
        },
    })

    await producer.connect()

    global.APP_EVENTS.on("future_price", async (_data) => {

        // Define a PartitionOffset object
        const partitionOffset = {
            topic: _data.topic,
            partition: 2, // specify the partition number
            offset: 1000, // specify the offset value
        };

        await producer.send({
            topic: _data.topic,
            messages: [{ value: JSON.stringify(_data.message), partition: 2 }]
        })
    })

    // await producer.disconnect()
}

module.exports = producer
