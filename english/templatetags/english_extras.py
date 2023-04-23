from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

def convert_date_v1(value): # 4 April
    return f"{value.day} {value.strftime('%B')}, {value.hour}:{value.minute}"

register.filter("convert_date_v1", convert_date_v1)