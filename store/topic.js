
const { kafka_instance } = require("../config")

const topics = process.env?.KAFKA_TOPIC?.toString().trim().split(" ") || []

const create_topic = async () => {
    try {

        const admin = kafka_instance.admin()

        // ! Connecting to Kafka Server
        console.info("Connecting to Kafka Server...")
        await admin.connect()
        console.info("Kafka connected!")

        const previously_existing_topic = await admin.listTopics()
        for (const _single_topic_index in topics) {
            const _single_topic = topics[_single_topic_index]
            if (previously_existing_topic.includes(_single_topic)) {
                console.info(`Topic "${_single_topic}" already exist.`)
            } else {
                // ! Creating Topic
                await admin.createTopics({
                    topics: [
                        { 
                            topic: _single_topic, 
                            numPartitions: 2,
                            configEntries: [
                                { name: "retention.ms", value: "5000" }
                            ]
                        }
                    ]
                })
                console.info(`Topic "${_single_topic}" is created successfully.`)
            }
        }

        // ! Disconnecting from Kafka Server
        await admin.disconnect()
        console.log("Kafka disconnected.")
    } catch (error) {
        console.error("Kafka Topic creation Error: ", error)
        // console.error(error, "\n\n")
    }
}

module.exports = create_topic
