from django.db.models import Expression

# https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Dice%27s_coefficient#Python
def dice_coefficient(a,b):
    if not len(a) or not len(b): return 0.0
    """ quick case for true duplicates """
    if a == b: return 1.0
    """ if a != b, and a or b are single chars, then they can't possibly match """
    if len(a) == 1 or len(b) == 1: return 0.0

    """ use python list comprehension, preferred over list.append() """
    a_bigram_list = [a[i:i+2] for i in range(len(a)-1)]
    b_bigram_list = [b[i:i+2] for i in range(len(b)-1)]

    a_bigram_list.sort()
    b_bigram_list.sort()

    # assignments to save function calls
    lena = len(a_bigram_list)
    lenb = len(b_bigram_list)
    # initialize match counters
    matches = i = j = 0
    while (i < lena and j < lenb):
        if a_bigram_list[i] == b_bigram_list[j]:
            matches += 2
            i += 1
            j += 1
        elif a_bigram_list[i] < b_bigram_list[j]:
            i += 1
        else:
            j += 1

    score = float(matches)/float(lena + lenb)
    return score

def search_score(dbitem, search):
    if 'landmark_name' in dbitem.keys(): dice_score = dice_coefficient(dbitem['landmark_name']+'_'+dbitem['name'], search['pattern'])
    else: dice_score = dice_coefficient(dbitem['name'], search['pattern'])
    distance_sq = (dbitem['lat']-search['lat'])*(dbitem['lat']-search['lat']) + (dbitem['lng']-search['lng'])*(dbitem['lng']-search['lng'])
    return (dice_score+0.01)/(distance_sq+10)


def find_nearest(lat, lng, landmarks, thres):
    '''
    Find nearest landmark in landmarks using lat and lng. If nearest distance > thres, return None
    '''
    minidx = -1
    minval = 10000
    for i, landmark in enumerate(landmarks):
        dis_sq = (lat-landmark['lat'])*(lat-landmark['lat']) + (lng-landmark['lng'])*(lng-landmark['lng'])
        if dis_sq < minval:
            minval = dis_sq
            minidx = i
    if minval > thres*thres: return None
    return landmarks[minidx]