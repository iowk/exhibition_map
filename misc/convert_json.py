import os
import json
import argparse

# Compat existing landmark or content database to django database (json)

def ConvertCctwLandmark(inp_dic, ownerid):
    out_dic = {}
    required_fields = ['name', 'longitude', 'latitude']
    for item in required_fields:
        if not item in inp_dic.keys():
            return out_dic
    out_dic['owner'] = ownerid
    out_dic['name'] = inp_dic['name']
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
    return out_dic

if __name__=='__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('inp_file', help='Input json file path')
    parser.add_argument('out_file', help='Output json file path')
    parser.add_argument('tag', help='Database tag')
    parser.add_argument('--ownerid', type=int, default=1, help='Landmark or content owner')

    args = parser.parse_args()

    inp = json.load(open(args.inp_file, 'r'))
    out = []
    for inp_dic in inp:
        out_dic = {}
        if args.tag == 'cctw_lm':
            # From cloud.culture.tw
            out_dic = ConvertCctwLandmark(inp_dic, args.ownerid)
        if len(out_dic) > 0:
            print(out_dic['name'], "added")
            out.append(out_dic)
    print(len(out), "items added")
    if len(out) > 0: json.dump(out, open(args.out_file, 'w'), indent=6)