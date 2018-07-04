// https://www.aamva.org/dl-id-card-design-standard/
// 2013 AAMVA DL/ID Card Design Standard
// D.13 Example of raw PDF417 data

var data = [
    "@\n\u001e\r",
    "ANSI 636000080002DL00410278ZV03190008DLDAQT64235789L\n",
    "DCSSAMPLE\n",
    "DDENL\n",
    "DACMICHAEL\n",
    "DDFN\n",
    "DADJOHN\n",
    "DDGN\n",
    "DCUJR\n",
    "DCAD\n",
    "DCBK\n",
    "DCDPH\n",
    "DBD06062008\n",
    "DBB06061986\n",
    "DBA12102013\n",
    "DBC1\n",
    "DAU068 in\n",
    "DAYBRO\n",
    "DAG2300 WEST BROAD STREET\n",
    "DAIRICHMOND\n",
    "DAJVA\n",
    "DAK232690000\n",
    "DCF2424244747474786102204\n",
    "DCGUSA\n",
    "DCK123456789\n",
    "DDAM\n",
    "DDB06062008\n",
    "DDC06062009\n",
    "DDD1\r",
    "ZVZVA01\r"
].join("");

AAMVAtoJSON(data);
