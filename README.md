# FieldComm Pro - React Web App

A professional construction management web application built with React, converted from HTML prototypes.

## Features

- **Daily Report**: Track daily progress, crew, and site conditions
- **Field Walk**: Document observations and issues in the field
- **Punch List**: Manage and track punch list items
- **Reply**: Respond to foreman assignments

## Technologies

- React 18
- React Router for navigation
- Vite for build tooling
- Responsive design for mobile and desktop

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The production-ready build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

The application can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder or connect your Git repository
- **Vercel**: Connect your Git repository for automatic deployments
- **GitHub Pages**: Use the `dist` folder after building
- **AWS S3 + CloudFront**: Upload the `dist` folder to S3 and serve via CloudFront

### Environment Configuration

The app uses relative paths (`base: './'` in vite.config.js) making it compatible with any hosting path.

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/          # Page components
  ├── styles/         # Global styles
  ├── App.jsx         # Main app component with routing
  └── main.jsx        # Entry point
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Voice recognition features require browser support for Web Speech API

## License

Proprietary - FieldComm Pro
