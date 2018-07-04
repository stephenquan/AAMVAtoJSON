function AAMVAtoJSON(data) {
    var m = data.match(/^@\n\u001e\r(ANSI )(\d{6})(\d{2})(\d{2})(\d{2})/);
    if (!m) {
        return null;
    }

    var obj = {
        header: {
            IIN: m[2],
            AAMVAVersion: parseInt(m[3]),
            jurisdictionVersion: parseInt(m[4]),
            numberOfEntries: parseInt(m[5])
        }
    };

    for (var i = 0; i < obj.header.numberOfEntries; i++) {
        var offset = 21 + i * 10;
        m = data.substring(offset, offset + 10).match(/(.{2})(\d{4})(\d{4})/);
        var header = {
            subfileType: m[1],
            offset: parseInt(m[2]),
            length: parseInt(m[3])
        };
        obj[header.subfileType] = data.substring(header.offset + 2, header.offset + header.length - 1).split("\n").reduce(function (p, c) {
            p[c.substring(0,3)] = c.substring(3);
            return p;
        }, { } );
    }

    return obj;
}
