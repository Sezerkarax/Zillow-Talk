# Εδώ υλοποιούμε τον κομμάτι που μιλάει με τη βάση δεδομένων (MongoDB)·
# η δουλειά του είναι να βρίσκει τα μαξιλάρια, να τα ταξινομεί ανά τιμή,
# να προσθέτει Likes και να στέλνει όλα αυτά τα στοιχεία έτοιμα στην
# ιστοσελίδα μας για να εμφανιστούν.

# και στο images αποθηκεύουμε τα πραγματικά αρχεία των εικόνων που θα βλέπει ο χρήστης·
# κάθε φωτογραφία πρέπει να έχει όνομα που ταιριάζει ακριβώς με αυτό που έχουμε
# δηλώσει στη βάση δεδομένων, ώστε το σύστημα να ξέρει ποια εικόνα αντιστοιχεί
# σε ποιο μαξιλάρι.

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import ObjectId


app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb://localhost:27017/products_db"
mongo = PyMongo(app)
@app.route("/init")
def init():
    mongo.db.products.delete_many({}) #delete previous data
    data=[]
    pillows=["Latex","Cotton","Wool","Buckwheat","Kapok","Microbeads","Memory Foam","Cooling Gel","Latex","Cotton","Wool","Buckwheat","Kapok","Microbeads","Memory Foam","Cooling Gel","Latex","Cotton","Wool","Buckwheat","Cat"]
    descriptions = [
        "Φυσικό Latex με ελαστική δομή που αναπνέει και προσφέρει τέλεια στήριξη στον αυχένα.",
        "Κλασικό βαμβακερό μαξιλάρι από 100% αγνό βαμβάκι για απόλυτη απαλότητα και δροσιά.",
        "Φυσικό μαλλί υψηλής ποιότητας που ρυθμίζει τη θερμοκρασία για άνετο ύπνο όλο το χρόνο.",
        "Παραδοσιακή στήριξη με φλοιό φαγόπυρου που προσαρμόζεται ακριβώς στο σχήμα του κεφαλιού.",
        "Φυτική ίνα Kapok, ελαφριά και μεταξένια, προσφέρει την αίσθηση του πούπουλου σε 100% vegan μορφή.",
        "Ειδικά μικροσφαιρίδια (Microbeads) που ακολουθούν κάθε σας κίνηση για μέγιστη ανακούφιση.",
        "Προηγμένος αφρός μνήμης (Memory Foam) που εκμηδενίζει τις πιέσεις και αγκαλιάζει το σώμα.",
        "Καινοτόμο Cooling Gel που διατηρεί την επιφάνεια δροσερή, ιδανικό για ζεστά κλίματα."
    ]
    prices=[40,20,25,35,45,30,35,50,40,50,50,65,115,65,40,75,40,60,20,45,30]
    for i in range(20):
        product={
            "name": f"{pillows[i]} Pillow {i+1}",
            "image": f"./../static/images/{i+1}.jpg",
            "description": descriptions[i%8],
            "likes": 0,
            "price": prices[i]
        }
        data.append(product)

    product= {"name": f"{pillows[20]} Pillow {21}", #for unique cat pillow
             "image": f"./../static/images/{21}.jpg",
             "description": "Παχουλός χνουδωτός φίλος",
             "likes": 0,
             "price": prices[20]}

    data.append(product)

    mongo.db.products.insert_many(data) #add data
    return jsonify({"message": "Products inserted"})
@app.route("/search", methods=["GET"])
def search():
   name = request.args.get("name", "")
   if name == "":
        query={} #show everything
   else:
        query = {"name": {"$regex": name, "$options": "i"}} #regex finds if value of name is included, options i,for no case sensitive
   toShow=mongo.db.products.find(query).sort("price", -1) #short descending according to price
   results=[]
   for product in toShow:
       product["_id"] = str(product["_id"]) #covert object id to string (mongo.db.products.find returns type cursor, jsonify expects list)
       results.append(product)
   return jsonify(results)

@app.route("/like",methods=["POST"])
def like():
    data=request.get_json()
    id=data.get("id")  #get id from db
    mongo.db.products.update_one(
        {"_id": ObjectId(id)},
        {"$inc": {"likes": 1}} #$inc to increment likes by 1
    )
    return jsonify({"message": "Like added!"})


@app.route("/popular",methods=["GET"])
def popular():
    top5List=[]
    top5Cursor=mongo.db.products.find().sort("likes", -1).limit(5) #find top 5 based on likes (descending)
    for product in top5Cursor:
        product["_id"] = str(product["_id"])  # covert object id to string (mongo.db.products.find returns type cursor, jsonify expects list)
        top5List.append(product)
    return jsonify(top5List)

if __name__ == "__main__":
    app.run(debug=True)
