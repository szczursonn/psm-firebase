import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js'
import { getFirestore, getDocs, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyCiuHm8rMciVlj0A1rjquD2hFAPJAg8FUA",
    authDomain: "psm-firebase-4f74c.firebaseapp.com",
    projectId: "psm-firebase-4f74c",
    storageBucket: "psm-firebase-4f74c.appspot.com",
    messagingSenderId: "317824968239",
    appId: "1:317824968239:web:875d9971ab5ed6dfbc08da"
};

const SELECTORS = {
    PRODUCT_LOADING_OVERLAY: '#productLoadingOverlay',
    PRODUCT_ADD_LOADING_OVERLAY: '#productAddLoadingOverlay',
    PRODUCTS_CONTAINER: '#products-container',
    PRODUCT_ADD_INPUT: {
        MANUFACTURER: '#product-input-manufacturer',
        MODEL: '#product-input-model',
        PRICE: '#product-input-price',
        YEAR: '#product-input-makeyear',
        FEATURES_CONTAINER: '#product-input-features'
    },
    PRODUCT_ADD_FORM: '#product-form',
    PRODUCT_ADD_FEATURE_BUTTON: '#product-input-features-add-btn'
}

const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)

const carsCollectionRef = collection(firestore, 'cars')

const createElement = ({ tag, className, textContent, customStyle, customAttributes, parent } = {}) => {
    const el = document.createElement(tag)
    if (textContent !== undefined) {
        el.textContent = textContent
    }
    if (className !== undefined) {
        el.className = className
    }
    if (customStyle !== undefined) {
        el.style.cssText = customStyle
    }
    if (customAttributes !== undefined) {
        for (const [k, v] of Object.entries(customAttributes)) {
            el.setAttribute(k, v)
        }
    }
    if (parent !== undefined) {
        parent.appendChild(el)
    }
    return el
}
const showProductLoading = () => {
    document.querySelector(SELECTORS.PRODUCT_LOADING_OVERLAY).style.display = 'flex'
}

const hideProductLoading = () => {
    document.querySelector(SELECTORS.PRODUCT_LOADING_OVERLAY).style.display = 'none'
}

const showAddProductLoading = () => {
    document.querySelector(SELECTORS.PRODUCT_ADD_LOADING_OVERLAY).style.display = 'flex'
}

const hideAddProductLoading = () => {
    document.querySelector(SELECTORS.PRODUCT_ADD_LOADING_OVERLAY).style.display = 'none'
}

const getProducts = async () => {
    showProductLoading()
    const res = await getDocs(carsCollectionRef)
    const products = res.docs.map(doc => doc.data())
    updateProductsList(products)
    hideProductLoading()
}

const updateProductsList = (products) => {
    const productsContainer = document.querySelector(SELECTORS.PRODUCTS_CONTAINER)
    productsContainer.innerHTML = ''

    for (const product of products) {

        const cardBody = createElement({
            tag: 'div',
            className: 'card-body',
            parent: createElement({
                tag: 'div',
                className: 'card mt-4',
                customStyle: 'height: 210px;',
                parent: createElement({
                    tag: 'div',
                    className: 'col-lg-2 col-md-4 col-sm-12',
                    parent: productsContainer
                })
            })
        })

        createElement({
            tag: 'h5',
            className: 'card-title',
            textContent: `${product.manufacturer} ${product.model}`,
            parent: cardBody
        })

        let subtitle = product.year ?? ''
        if (subtitle) {
            subtitle += ' · '
        }
        if (product.price !== undefined) {
            subtitle += `${product.price}$`
        }


        createElement({
            tag: 'h6',
            className: 'card-subtitle mb2 text-muted',
            textContent: subtitle,
            parent: cardBody
        })

        if (product.features instanceof Array) {
            const featuresList = createElement({
                tag: 'ul',
                className: 'list-group mt-2',
                parent: cardBody
            })

            for (const feature of product.features) {
                createElement({
                    tag: 'li',
                    className: 'list-group-item',
                    textContent: feature,
                    parent: featuresList
                })
            }
        }
    }
}

const addFeaturesInputRow = () => {
    const featuresContainer = document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.FEATURES_CONTAINER)
    createElement({
        tag: 'input',
        className: 'form-control mt-1',
        customAttributes: {
            type: 'text'
        },
        parent: featuresContainer
    })
}

const resetAddProductForm = () => {
    document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.MANUFACTURER).value = ''
    document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.MODEL).value = ''
    document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.PRICE).value = ''
    document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.YEAR).value = ''
    document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.FEATURES_CONTAINER).innerHTML = ''
    addFeaturesInputRow()
}

const handleFormSubmit = (e) => {
    e.preventDefault()
    showAddProductLoading()

    const newProduct = {
        manufacturer: document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.MANUFACTURER).value,
        model: document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.MODEL).value
    }

    const price = document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.PRICE).valueAsNumber
    if (!Number.isNaN(price)) {
        newProduct.price = price
    }

    const year = document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.YEAR).value
    if (typeof year === 'string' && year.length > 0) {
        newProduct.year = year
    }

    const features = Array.from(document.querySelector(SELECTORS.PRODUCT_ADD_INPUT.FEATURES_CONTAINER).children).map((el) => el.value).filter(val => val)
    if (features.length > 0) {
        newProduct.features = features
    }

    console.log('newProduct: ', newProduct)

    addDoc(carsCollectionRef, newProduct).then(() => {
        resetAddProductForm()
        getProducts()
    }).catch((err) => {
        console.err(err)
    }).finally(() => {
        hideAddProductLoading()
    })
}

// init
document.querySelector(SELECTORS.PRODUCT_ADD_FORM).addEventListener('submit', handleFormSubmit)
document.querySelector(SELECTORS.PRODUCT_ADD_FEATURE_BUTTON).addEventListener('click', addFeaturesInputRow)
getProducts()