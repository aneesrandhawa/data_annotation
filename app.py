from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith('.jsonl'):
            df = pd.read_json(file_path, lines=True)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        elif file.filename.endswith('.xls'):
            df = pd.read_excel(file_path, engine='xlrd')
        else:
            return jsonify({'error': 'Unsupported file format'})
        return df.to_json(orient='records')
    return jsonify({'error': 'File upload failed'})

@app.route('/save_annotations', methods=['POST'])
def save_annotations():
    data = request.json
    annotations = data['annotations']
    print(annotations)
    # Save annotations to a file or database
    return jsonify({'status': 'success', 'message': 'Annotations saved successfully'})

if __name__ == '__main__':
    app.run(debug=True,port=5000)

    # app.run(port=5001)
