import json
import os, os.path 
import errno

# Data to be written
dictionary = {
    "name": "sathiyajith",
    "rollno": 56,
    "cgpa": 8.6,
    "phonenumber": "9976770500"
}
 
# Serializing json
json_object = json.dumps(dictionary, indent=4)

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

def safe_open_w(path):
    ''' Open "path" for writing, creating any parent directories as needed.
    '''
    mkdir_p(os.path.dirname(path))
    return open(path, 'w')


cities = []
# Reading cities data
with open("data/cities/cities.json", "r", encoding='utf-8') as file_cities:
    cities = json.load(file_cities)
    

# Reading Countries
with open("data/countries/countries.json", "r", encoding='utf-8') as openfile:
    countries = json.load(openfile)
    for country in countries:
        citiesData = [c for c in cities if c['country_name'] == country['name'] ]
        with safe_open_w("data/cities/"+country['name']+".json") as f:
            json.dump(citiesData, f)


