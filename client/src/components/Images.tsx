import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createImg, deleteImg, getImages, patchImg } from '../api/images-api'
import Auth from '../auth/Auth'
import { ImgItem } from '../types/ImgItem'

interface ImagesProps {
  auth: Auth
  history: History
}

interface ImagesState {
  images: ImgItem[]
  newImgName: string
  loadingImages: boolean
}

export class Images extends React.PureComponent<ImagesProps, ImagesState> {
  state: ImagesState = {
    images: [],
    newImgName: '',
    loadingImages: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newImgName: event.target.value })
  }

  onEditButtonClick = (imgId: string) => {
    this.props.history.push(`/images/${imgId}/edit`)
  }

  onImgCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      
      const newImg = await createImg(this.props.auth.getIdToken(), {
        name: this.state.newImgName
      })
      this.setState({
        images: [...this.state.images, newImg],
        newImgName: ''
      })
    } catch {
      alert('Img creation failed')
    }
  }

  onImgDelete = async (imgId: string) => {
    try {
      await deleteImg(this.props.auth.getIdToken(), imgId)
      this.setState({
        images: this.state.images.filter(image => image.imgId != imgId)
      })
    } catch {
      alert('Img deletion failed')
    }
  }

  

  async componentDidMount() {
    try {
      const images = await getImages(this.props.auth.getIdToken())
      this.setState({
        images,
        loadingImages: false
      })
    } catch (e) {
      alert(`Failed to fetch images: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">AUTOTAGGED-IMAGES</Header>

        {this.renderCreateImgInput()}

        {this.renderImages()}
      </div>
    )
  }

  renderCreateImgInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New image name',
              onClick: this.onImgCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Name ..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderImages() {
    if (this.state.loadingImages) {
      return this.renderLoading()
    }

    return this.renderImagesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Images
        </Loader>
      </Grid.Row>
    )
  }

  renderImagesList() {
    return (
      <Grid padded>
        {this.state.images.map((img, pos) => {
          return (
            <Grid.Row key={img.imgId}>
              <Grid.Column width={10} verticalAlign="middle">
                {img.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(img.imgId)}
                >
                  <Icon name="upload" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onImgDelete(img.imgId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {img.attachmentUrl && (
                <Image src={img.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  
}
