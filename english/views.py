from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse
from .models import LearningList, ListReview, Word, WordImage, Example, WordLastReview
import datetime
import json
import random
import re
from django.http import JsonResponse
from django.core import serializers
from .forms import RegisterForm

def signup_view(request):
    message = None
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            email = form.cleaned_data.get("email")
            user = authenticate(username=username, password = raw_password, email = email)
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            message = "Invalid inputs"
    else:
        form = UserCreationForm()
    return render(request, "english/signup.html", {'form': form, "message": message})

def index(request):
    # If no user is signed in, return to login page:
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    learning_lists = LearningList.objects.filter(user = request.user, learned = False).prefetch_related("reviews")
    last_viewed = []
    for list in learning_lists:
        last_view = list.reviews.all().order_by('-datetime').first()
        if last_view:
            last_viewed.append(last_view.datetime)
        else:
            last_viewed.append("not yet")

    learned_lists = LearningList.objects.filter(user = request.user, learned = True).prefetch_related("words")
    learned_list_count = learned_lists.count()
    total_words = 0
    today_reviewed = 0

    ### FIND WORD REVIEW OF THIS USER TODAY MADE
    user_word_reviews = WordLastReview.objects.filter(user = request.user)
    for x in user_word_reviews:
        if x.datetime.date() == datetime.datetime.today().date():
            today_reviewed += 1
    

    for list in learned_lists:
        total_words += list.words.all().count()

    if today_reviewed > 199:
        today_reviewed_message_class = "message-ok m-v10"
    else:
        today_reviewed_message_class = "message-alert m-v10"

    return render(request, "english/index.html", {
        "User": request.user,
        "data": zip(learning_lists, last_viewed),
        "learned_list_count": learned_list_count,
        "learned_words": total_words,
        "today_reviewed": today_reviewed,
        "today_reviewed_message_class": today_reviewed_message_class
    })

def login_view(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))
    if request.method == "POST":
        # Accessing username and password from form data
        username = request.POST["username"]
        password = request.POST["password"]

        # Check if username and password are correct, returning User object if so
        user = authenticate(request, username=username, password=password)

        # If user object is returned, log in and route to index page:
        if user:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        # Otherwise, return login page again with new context
        else:
            return render(request, "english/login.html", {
                "message": "Invalid Credentials"
            })
    else:
        return render(request, "english/login.html")

def logout_view(request):
    logout(request)
    return render(request, "english/login.html", {
                "message": "Logged Out"
            })

def reviewed_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    data = {}
    try:
        m_list = json.loads(request.body.decode('utf-8'))
        # find list
        list_id = ( re.search('#(.*):', m_list["m_list"]) ).group(1)
        my_list = LearningList.objects.get(id = list_id)
        new_review = ListReview(list = my_list, datetime = datetime.datetime.now())
        new_review.save()

        data["result"] = 1
    except Exception as e:
        data["result"] = 0
        data["message"] = str(e)
        print(e)
        return JsonResponse({ "data": data })

    return JsonResponse({
        'data': data
    })

def new_list_create_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    data = {}
    try:
        data = json.loads(request.body.decode('utf-8'))
        # find word list (! coming array with ids as string)
        checked_word_ids = data["checked_word_ids"]

        print("checked word ids", checked_word_ids)

        # CHECK word_list HAS NO WORDS USER ADDED BEFORE

        # CREATE NEW LIST
        n_list = LearningList.objects.create(user = request.user, created = datetime.datetime.now(), learned = False)

        # ADD WORDS TO THE NEW LIST
        for x in checked_word_ids:
            n_list.words.add(Word.objects.get(id = int(x)))

        # SAVE NEW LIST
        n_list.save()


        data["result"] = 1
    except Exception as e:
        data["result"] = 0
        data["message"] = str(e)
        print(e)
        return JsonResponse({ "data": data })

    return JsonResponse({
        'data': data
    })

def review_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    if request.method == "GET" and not request.GET['l']:
        return HttpResponseRedirect(reverse("index"))

    # TAKE WORD LIST, IMAGES AND EXAMPLES
    try:
        my_list = LearningList.objects.prefetch_related("words").get(id = request.GET['l'])

        # WORDS (and shuffle)
        my_words = sorted(my_list.words.all(), key=lambda x: random.random())

        word_images = []
        example_lists = []

        print("words: ", my_words)
        for m_word in my_words:
            print("m_word['id']: ", m_word.id)
            # IMAGES
            # token first image, because multi image option disabled
            m_word_image = WordImage.objects.filter(word = m_word.id).first()
            print("m_word: ", m_word, "m_word_image: ", m_word_image)
            word_images.append(m_word_image.url)

            # EXAMPLES
            m_examples = m_word.examples.values_list('sentence', flat = True)
            m_examples = list(m_examples)
            example_lists.append(m_examples)

    except Exception as e:
        print("error", str(e))
        return HttpResponseRedirect(reverse("index"))

    if not my_list:
        return HttpResponseRedirect(reverse("index"))

    print("my_list: ", my_list)

    return render(request, "english/review.html", {
        "my_list": my_list,
        "my_words": serializers.serialize("json", my_words),
        "word_images": json.dumps(word_images),
        "example_lists": json.dumps(example_lists)
    })

def new_list_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    userLists = LearningList.objects.filter(user = request.user)
    print("userLists: ", userLists)
    userWords = []
    notUserWords = []
    for list in userLists:
        for word in list.words.all():
            userWords.append(word)

    all_words = Word.objects.all()
    for x in all_words:
        if x not in userWords:
            notUserWords.append(x.id)

    print(notUserWords)

    word_images = WordImage.objects.values( "word__id", "word__word", "url", "users", "word__level__code")

    words_cooking = [
        {
            "id": x["word__id"],
            "word": x["word__word"],
            "level": x["word__level__code"],
            "image": sorted(WordImage.objects.filter(word = x["word__id"]).values("id", "url"), key=lambda x: random.random())
        }
        for x in word_images if x["word__id"] in notUserWords
    ]
    words_cooked = []
    [words_cooked.append(word) for word in words_cooking if word not in words_cooked]

    # print(len(words_cooking), len(words_cooked))
    print("cooked words: ", words_cooked)
    return render(request, "english/new-list.html", {
        "words": json.dumps(words_cooked)
    })

def move_list_learned_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    data = {}

    try:
        data = json.loads(request.body.decode('utf-8'))
        # FIND LIST
        list_id = data["list_id"]

        my_list = LearningList.objects.get(id = list_id)

        my_list.learned = True
        my_list.save()

        data["result"] = 1

    except Exception as e:
        data["result"] = 0
        data["message"] = str(e)
        print(str(e))
        return JsonResponse({ "data": data })

    return JsonResponse({ 'data': data })

def my_words_review_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    # waiting: words = [ { "id": 5, "word": "acquaintances", "img_url": "for_good.jpg", "meaning": "bla bla bla", "examples": ["example1", "example2"] } ];

    # TAKE LEARNED LISTS
    learned_lists = LearningList.objects.filter(user = request.user, learned = True)
    # TAKE LEARNED WORDS FROM LEARNED LISTS
    learned_words = []
    for x in learned_lists:
        for y in x.words.all().values("id", "word", "meaning"):
            learned_words.append(y)

    # ADJUST HOW MANY WORDS WILL SEND
    quantity = len(learned_words)
    if len(learned_words) > 100:
        quantity = 100

    # TAKE quantity AMOUNT OF WORDS RANDOMLY AND THOSE REQUIRED INFORMATION
    random_choosen = random.sample(learned_words, k=quantity)
    random_images = []
    random_examples = []
    for x in random_choosen:
        word_image = WordImage.objects.filter(word__id = x["id"]).first()
        examples = Example.objects.filter(word__id = x["id"]).values("sentence")
        exs = []
        for ex in examples:
            exs.append(ex["sentence"])
        
        random_examples.append(exs)
        random_images.append(word_image.url)
    
    print("random examples: ", random_examples)
    # COOK LIST AS REQUIRED FROM DATA
    random_cooking = [
        {
            "id": x["id"],
            "word": x["word"],
            "meaning": x["meaning"],
            "img_url": rnd_img,
            "examples": rnd_examp
        }
        for x,rnd_img, rnd_examp in zip(random_choosen, random_images, random_examples)
    ]
    print("random cooking: ", random_cooking)

    return render(request, "english/my-words-review.html", {
        "words_s": json.dumps(random_cooking)
    })

def word_reviewed_view(request):
    # LOGIN REQUIRED
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))
    
    data = {}

    try:
        data = json.loads(request.body.decode('utf-8'))
        # FIND WORD
        word_id = data["word_id"]

        # FIND LAST VIEW OF WORD ON USER IF EXIST
        last_views = WordLastReview.objects.filter(user = request.user.id, word__id = word_id)

        # IF THERE IS FIELD WordLastReview WITH USER AND WORD, UPDATE datetime
        # ELSE CREATE NEW ONE
        if (len(last_views) > 0):
            upd = last_views.first()
            upd.datetime = datetime.datetime.now()
            upd.save()
        else:
            word = Word.objects.get(id = word_id)
            WordLastReview.objects.create(user = request.user, word = word, datetime = datetime.datetime.now())

        data["result"] = 1
    except Exception as e:
        data["result"] = 0
        data["message"] = str(e)
        print(str(e))
        return JsonResponse({ "data": data })

    return JsonResponse({ "data": data })