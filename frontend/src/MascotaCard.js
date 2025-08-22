import { Card, CardActionArea, CardMedia, CardContent, Typography, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function MascotaCard({ mascota, onClick, showEditDelete, onEdit, onDelete }) {
  return (
    <Card sx={{ maxWidth: 320, minWidth: 220, m: 1, boxShadow: 3, position: 'relative', width: { xs: '100%', sm: 260, md: 320 } }}>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image={mascota.fotoUrl || 'https://via.placeholder.com/320x200?text=Sin+Foto'}
          alt={mascota.nombre}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: { xs: 18, sm: 20 } }}>
            {mascota.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 13, sm: 15 } }}>
            {mascota.tipo} • {mascota.raza} • {mascota.edad} años
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip label={mascota.adoptado ? 'Adoptado' : 'Disponible'} color={mascota.adoptado ? 'success' : 'primary'} size="small" />
            {showEditDelete && (
              <span>
                <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit && onEdit(mascota); }}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete && onDelete(mascota); }}><DeleteIcon fontSize="small" /></IconButton>
              </span>
            )}
          </Box>
          {mascota.usuario && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Publicado por: {mascota.usuario.username}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default MascotaCard;
