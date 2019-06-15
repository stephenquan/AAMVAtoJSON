function AAMVAtoJSON(data, options = { format: "string" } ) {
    // Detect AAMVA header:
    //   1. First two characters: "@\n"
    //   2. Third character should be 0x1e but we ignore because of South Carolina 0x1c edge condition
    //   3. Next 5 characters either "ANSI " or "AAMVA"
    //   4. Next 12 characters: IIN, AAMVAVersion, JurisdictionVersion, numberOfEntries
    let [ header, AAMVAType, IIN, AAMVAVersion, jurisdictionVersion, numberOfEntries ]
        = data.match(/^@\n.\r(ANSI |AAMVA)(\d{6})(\d{2})(\d{2})(\d{2})?/) || [ ]
    AAMVAVersion = +AAMVAVersion
    jurisdictionVersion = +jurisdictionVersion

    let obj = {
        header: {
            AAMVAType: AAMVAType,
            IIN: IIN,
            AAMVAVersion: AAMVAVersion,
            jurisdictionVersion: jurisdictionVersion
        }
    }

    for (let i = 0; !numberOfEntries || i < numberOfEntries; i++) {
        const entryOffset = header.length + i * 10
        let [ , subfileType, offset, length ]
            = data.substring(entryOffset, entryOffset + 10).match(/(.{2})(\d{4})(\d{4})/) || [ ]
        if (!subfileType) break
        offset = +offset
        length = +length
        if (i === 0) obj.files = [ ]
        obj.files.push(subfileType)
        obj[subfileType] = data.substring(offset + 2, offset + length).trim().split(/\n\r?/).reduce((p, c) => {
            p[c.substring(0,3)] = c.substring(3)
            return p
        }, { } )
    }

    // Convert date string (in local timezone) into Javascript UTC time
    function convertAAMVADate(str, country) {
        function convertMMDDCCYY(str) {
            const [ __str, month, day, year ] = str.match(/(\d{2})(\d{2})(\d{4})/) || [ ]
            if (!__str) return null
            return new Date(year, month-1, day).getTime()
        }
        function convertCCYYMMDD(str) {
            const [ __str, year, month, day ] = str.match(/(\d{4})(\d{2})(\d{2})/) || [ ]
            if (!__str) return null
            return new Date(year, month-1, day).getTime()
        }
        switch (country) {
        case "USA": return convertMMDDCCYY(str)
        case "CAN": return convertCCYYMMDD(str)
        default: return convertCCYYMMDD(str)
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
