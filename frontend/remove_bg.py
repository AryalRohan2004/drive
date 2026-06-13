from rembg import remove

input_path = 'public/logo.jpeg'
output_path = 'public/logo-transparent.png'

with open(input_path, 'rb') as i:
    with open(output_path, 'wb') as o:
        input_data = i.read()
        output_data = remove(input_data)
        o.write(output_data)
