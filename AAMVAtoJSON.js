function AAMVAtoJSON(data, options = { format: "string" } ) {
    // Detect AAMVA header:
    //   1. First two characters: "@\n"
    //   2. Third character should be 0x1e but we ignore because of South Carolina 0x1c edge condition
    //   3. Next 5 characters either "ANSI " or "AAMVA"
    //   4. Next 12 characters: IIN, AAMVAVersion, JurisdictionVersion, numberOfEntries
    const [ __data,
            AAMVAType,
            IIN,
            AAMVAVersion,
            jurisdictionVersion,
            numberOfEntries ] = data.match(/^@\n.\r(ANSI |AAMVA)(\d{6})(\d{2})(\d{2})(\d{2})/) || [ ]
    if (!__data) return null

    var obj = {
        header: {
            IIN: IIN,
            AAMVAVersion: +AAMVAVersion,
            jurisdictionVersion: +jurisdictionVersion,
            numberOfEntries: +numberOfEntries
        }
    }

    for (let i = 0; i < obj.header.numberOfEntries; i++) {
        let entryOffset = 21 + i * 10
        let [ __entry, subfileType, offset, length ]
            = data.substring(entryOffset, entryOffset + 10).match(/(.{2})(\d{4})(\d{4})/) || [ ]
        if (i === 0) obj.files = [ ]
        obj.files.push(subfileType)
        obj[subfileType] = data.substring(+offset + 2, +offset + +length).trim().split(/\n\r?/).reduce((p, c) => {
            p[c.substring(0,3)] = c.substring(3)
            return p
        }, { } )
    }

    // Convert date string (in local timezone) into Javascript UTC time
    function convertAAMVADate(str, country) {
        function convertAAMVADateUSA(str) {
            const [ __str, month, day, year ] = str.match(/(\d{2})(\d{2})(\d{4})/) || [ ]
            if (!__str) return null
            return new Date(year, month-1, day).getTime()
        }
        function convertAAMVADateCAN(str) {
            const [ __str, year, month, day ] = str.match(/(\d{4})(\d{2})(\d{2})/) || [ ]
            if (!__str) return null
            return new Date(year, month-1, day).getTime()
        }
        switch (country) {
        case "USA": return convertAAMVADateUSA(str)
        case "CAN": return convertAAMVADateCAN(str)
        default: return convertAAMVADateUSA(str)
        }
    } 
    
    if (obj.DL) {
        for (let k of ["DBA", "DBB", "DBD", "DDB", "DDC", "DDH", "DDI", "DDJ"]) {
            if (!obj.DL[k]) continue
            const t = convertAAMVADate(obj.DL[k], obj.DL.DCG)
            if (!t) continue
            obj.DL[k] = t
        }
    }
    
    if (options && options.format === "string") {
        return JSON.stringify(obj)
    }

    return obj
}
