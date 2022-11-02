import os
import json
import argparse

# Compat existing landmark or content database to django database (json)
DEFAULT_START_DATE = "1900-01-01"
DEFAULT_END_DATE = "2500-12-31"

def formatSlashDate(date):
    # Convert YYYY/MM/DD to YYYY-MM-DD
    return date.replace('/','-')

def ConvertCctwLandmark(inp_dic):
    out_dic = {}
    required_fields = ['title', 'longitude', 'latitude']
    for item in required_fields:
        if not item in inp_dic.keys():
            return out_dic
    out_dic['name'] = inp_dic['title']
    out_dic['lat'] = inp_dic['latitude']
    out_dic['lng'] = inp_dic['longitude']
    if 'website' in inp_dic.keys():
        out_dic['link'] = inp_dic['website']
    elif 'facebook' in inp_dic.keys():
        out_dic['link'] = inp_dic['facebook']
    if 'name_eng' in inp_dic.keys():
        out_dic['name_eng'] = inp_dic['name_eng']
    if 'ticketPrice' in inp_dic.keys():
        out_dic['price'] = inp_dic['ticketPrice']

def ConvertOctwContent(inp_dic):
    out_dic = {}
    if 'title' not in inp_dic.keys(): return out_dic
    if 'showInfo' not in inp_dic.keys() or len(inp_dic['showInfo'])==0: return out_dic
    if 'latitude' not in inp_dic['showInfo'][0].keys() or inp_dic['showInfo'][0]['latitude']==None: return out_dic
    if 'longitude' not in inp_dic['showInfo'][0].keys() or inp_dic['showInfo'][0]['latitude']==None: return out_dic
    out_dic['name'] = inp_dic['title']
    out_dic['lat'] = inp_dic['showInfo'][0]['latitude']
    out_dic['lng'] = inp_dic['showInfo'][0]['longitude']
    if 'startDate' in inp_dic.keys():  out_dic['startDate'] = formatSlashDate(inp_dic['startDate'])
    else: out_dic['startDate'] = DEFAULT_START_DATE
    if 'endDate' in inp_dic.keys(): out_dic['endDate'] = formatSlashDate(inp_dic['endDate'])
    else: out_dic['endDate'] = DEFAULT_END_DATE
    if 'price' in inp_dic['showInfo'][0].keys(): out_dic['price'] = inp_dic['showInfo'][0]['price']
    if 'descriptionFilterHtml' in inp_dic.keys(): out_dic['description'] = inp_dic['descriptionFilterHtml']
    return out_dic

if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('inp_file', help='Input json file path')
    parser.add_argument('out_file', help='Output json file path')
    parser.add_argument('tag', help='Database tag')
    parser.add_argument('--ownerid', type=int, default=6, help='Landmark or content owner')
    args = parser.parse_args()

    inp = json.load(open(args.inp_file, 'r'))
    out = []
    for inp_dic in inp:
        out_dic = {}
        if args.tag == 'cctw_lm':
            # From cloud.culture.tw
            out_dic = ConvertCctwLandmark(inp_dic)
        elif args.tag == 'octw_ct':
            # From https://opendata.culture.tw/frontsite/openData/
            out_dic = ConvertOctwContent(inp_dic)
        if len(out_dic) > 0:
            print(out_dic['name'], "added")
            out_dic['owner'] = args.ownerid
            out.append(out_dic)
    print(len(out), "items added")
    if len(out) > 0: json.dump(out, open(args.out_file, 'w'), indent=6)