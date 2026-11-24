exports.handler = async function (event) {
    const start = event.queryStringParameters.start;
    const end = event.queryStringParameters.end;

    const apiKey = process.env.SEOUL_API_KEY;

    const apiUrl = "http://openapi.seoul.go.kr:8088/" +
        apiKey + "/json/SeoulPublicLibraryInfo/" +
        start + "/" + end;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
    };
};