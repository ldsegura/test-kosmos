const get = async (_request, onSuccess, onError) => {
    try {
      await fetch(`https://jsonplaceholder.typicode.com/photos`)
        .then((res) => res.json())
        .then((response) => {
            onSuccess && onSuccess(response);
        });
    } catch (e) {
        onError && onError(e);
    }
  };

const photosAction = {
    get
}

export default photosAction;