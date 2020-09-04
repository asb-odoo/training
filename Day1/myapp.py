import os
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map, Rule, NotFound, RequestRedirect
from werkzeug.exceptions import HTTPException
from werkzeug.wsgi import SharedDataMiddleware
import csv, json
import uuid

session = {}


@Request.application
def application(request):
    urls = url_map.bind_to_environ(request.environ)
    # print(request.cookies)
    # request.c
    #print(request.args.get('query'))
    # sid = request.cookies.get('cookie_name')
    # if sid is None:
    #     request.session = session_store.new()
    # else:
    #     request.session = session_store.get(sid)
    
    

    return urls.dispatch(lambda e, v: views[e](request, **v),
                         catch_http_exceptions=True)


def cookieSearch(request):
    sid = request.cookies.get('sessionid')
    if sid and sid in session.keys():
        return session[sid]
    else:
        session[sid] = []



def index(request):
    html_string=None
    sid = request.cookies.get('sessionid')
    if sid:
        pass
    else:
        sid = uuid.uuid4()
        session[str(sid)] = []
    with open("template/index.html") as reader:
        html_string = reader.read()

    response = Response(html_string, content_type="text/html")
    response.set_cookie('sessionid', str(sid))
    return response


def display(request, **args):
    return Response("Display Products" + str(args))

def getAllProducts(request, **args):
    # Read CSV file 
    with open('products.csv') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=";")
        products = []
        for row in csvreader:
            products.append({'id':row[0], 'name':row[1], 'price': row[2]})

    return Response(json.dumps(products), content_type="application/json")

def getCart(request, **args):
    productids = cookieSearch(request)
    # Get product Details 
    # todo not good practice
    with open('products.csv') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=";")
        products = []
        for row in csvreader:
            if productids and row[0] in productids:
                products.append({'id':row[0], 'name':row[1], 'price': row[2]})
    return Response(json.dumps(products), content_type="application/json")

def search(request, **args): 
    
    query = request.form.get('query')
    # Read CSV file 
    # todo not good practice
    with open('products.csv') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=";")
        products = []
        for row in csvreader:
            products.append({'id':row[0], 'name':row[1], 'price': row[2]})
    # Filter products
    if query:
        products = list(filter(lambda x: x['name'].startswith(query), products))

    return Response(json.dumps(products), content_type="application/json")


def addtoCart(request, **args):
    prodid = request.form.get('prodid')
    sessioncart = cookieSearch(request)
    sessioncart.append(prodid)
    return Response()

def removefromCart(request, **args):
    
    prodid = request.form.get('prodid')
    sessioncart = cookieSearch(request)
    sessioncart.remove(prodid)
    return Response()


url_map = Map([
    Rule('/', endpoint='index'),
    Rule('/products', endpoint='products'),
    Rule('/search', endpoint='search'),
    Rule('/addcart', endpoint='cart'),
    Rule('/delitemcart', endpoint='delitemcart'),
    Rule('/getCart', endpoint="getcart"), 
])
views = {'index': index, 'search': search, 
    'products': getAllProducts, 
    'cart': addtoCart,'delitemcart':removefromCart , 
    'getcart': getCart}




if __name__ == '__main__':
    from werkzeug.serving import run_simple
    app = application
    app = SharedDataMiddleware(app, {
    '/static': os.path.join(os.path.dirname(__file__), 'static')
    })

    run_simple('localhost', 4000,   app)
